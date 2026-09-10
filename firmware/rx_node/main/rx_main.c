#include "esp_event.h"
#include "esp_http_server.h"
#include "esp_log.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/task.h"
#include "lwip/sockets.h"
#include "nvs.h"
#include "nvs_flash.h"
#include <ctype.h>
#include <string.h>
#include <sys/param.h>

static const char *TAG = "CSI_RX";

/* --- NETWORK CONFIGURATION --- */
#define WIFI_SSID "S K "
#define WIFI_PASS "12345sanjay"
#define HOST_IP "10.217.243.125" // <-- YOUR COMPUTER'S IP ADDRESS
#define HOST_PORT 5000

/* --- CSI CONFIGURATION --- */
#define CSI_WIFI_CHANNEL 6
#define NODE_ID 1 // <-- THIS BOARD IS NOW RX-02

char wifi_ssid[32] = WIFI_SSID;
char wifi_pass[64] = WIFI_PASS;
char host_ip[32] = HOST_IP;

static int s_udp_sock = -1;
static struct sockaddr_in s_dest_addr;
static uint32_t s_sequence = 0;

static int s_retry_num = 0;
#define WIFI_MAXIMUM_RETRY 5
static httpd_handle_t server = NULL;

/* RuView ADR-018 Binary Frame Format (20 byte header + I/Q Data) */
static size_t serialize_ruview_frame(const wifi_csi_info_t *info, uint8_t *buf,
                                     size_t buf_len) {
  uint16_t iq_len = (uint16_t)info->len;
  size_t frame_size = 20 + iq_len;
  if (frame_size > buf_len)
    return 0;

  uint16_t n_subcarriers = iq_len / 2;
  uint32_t magic = 0xC5110001; // RuView Magic Number
  uint32_t freq_mhz = 2412 + (info->rx_ctrl.channel - 1) * 5;
  uint32_t seq = s_sequence++;

  memcpy(&buf[0], &magic, 4);
  buf[4] = NODE_ID;
  buf[5] = 1; // n_antennas
  memcpy(&buf[6], &n_subcarriers, 2);
  memcpy(&buf[8], &freq_mhz, 4);
  memcpy(&buf[12], &seq, 4);
  buf[16] = (uint8_t)(int8_t)info->rx_ctrl.rssi;
  buf[17] = (uint8_t)(int8_t)info->rx_ctrl.noise_floor;
  buf[18] = 0; // reserved
  buf[19] = 0; // flags

  memcpy(&buf[20], info->buf, iq_len); // I/Q Data
  return frame_size;
}

static void wifi_csi_rx_cb(void *ctx, wifi_csi_info_t *info) {
  if (s_udp_sock < 0)
    return; // Wait until UDP is ready

  uint8_t frame_buf[1024];
  size_t frame_len = serialize_ruview_frame(info, frame_buf, sizeof(frame_buf));

  if (frame_len > 0) {
    sendto(s_udp_sock, frame_buf, frame_len, 0, (struct sockaddr *)&s_dest_addr,
           sizeof(s_dest_addr));
  }
}

static void wifi_promiscuous_cb(void *buf, wifi_promiscuous_pkt_type_t type) {}

static void init_udp_socket(void) {
  s_udp_sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_IP);
  s_dest_addr.sin_family = AF_INET;
  s_dest_addr.sin_port = htons(HOST_PORT);
  s_dest_addr.sin_addr.s_addr = inet_addr(host_ip);
  ESP_LOGI(TAG, "UDP Socket initialized targeting %s:%d", host_ip, HOST_PORT);
}

static void load_config_from_nvs(void) {
  nvs_handle_t my_handle;
  esp_err_t err = nvs_open("storage", NVS_READWRITE, &my_handle);
  if (err != ESP_OK)
    return;

  size_t required_size = 0;
  err = nvs_get_str(my_handle, "ssid", NULL, &required_size);
  if (err == ESP_OK && required_size <= sizeof(wifi_ssid)) {
    nvs_get_str(my_handle, "ssid", wifi_ssid, &required_size);
  }

  err = nvs_get_str(my_handle, "pass", NULL, &required_size);
  if (err == ESP_OK && required_size <= sizeof(wifi_pass)) {
    nvs_get_str(my_handle, "pass", wifi_pass, &required_size);
  }

  err = nvs_get_str(my_handle, "host_ip", NULL, &required_size);
  if (err == ESP_OK && required_size <= sizeof(host_ip)) {
    nvs_get_str(my_handle, "host_ip", host_ip, &required_size);
  }

  nvs_close(my_handle);
}

static void config_listener_task(void *pvParameters) {
  int sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_IP);
  if (sock < 0) {
    vTaskDelete(NULL);
    return;
  }

  struct sockaddr_in server_addr;
  server_addr.sin_family = AF_INET;
  server_addr.sin_port = htons(5001);
  server_addr.sin_addr.s_addr = htonl(INADDR_ANY);

  bind(sock, (struct sockaddr *)&server_addr, sizeof(server_addr));
  ESP_LOGI(TAG, "Config listener started on UDP 5001");

  char rx_buffer[256];
  while (1) {
    struct sockaddr_in source_addr;
    socklen_t socklen = sizeof(source_addr);
    int len = recvfrom(sock, rx_buffer, sizeof(rx_buffer) - 1, 0,
                       (struct sockaddr *)&source_addr, &socklen);

    if (len > 0) {
      rx_buffer[len] = 0;
      ESP_LOGI(TAG, "Received config command: %s", rx_buffer);
      char *comma = strchr(rx_buffer, ',');
      if (comma != NULL) {
        *comma = '\0';
        char *new_ssid = rx_buffer;
        char *new_pass = comma + 1;

        nvs_handle_t my_handle;
        if (nvs_open("storage", NVS_READWRITE, &my_handle) == ESP_OK) {
          nvs_set_str(my_handle, "ssid", new_ssid);
          nvs_set_str(my_handle, "pass", new_pass);
          nvs_commit(my_handle);
          nvs_close(my_handle);
          ESP_LOGI(TAG, "New config saved via UDP. Restarting...");
          vTaskDelay(pdMS_TO_TICKS(500));
          esp_restart();
        }
      }
    }
  }
}

static void urldecode2(char *dst, const char *src) {
  char a, b;
  while (*src) {
    if ((*src == '%') && ((a = src[1]) && (b = src[2])) &&
        (isxdigit((int)a) && isxdigit((int)b))) {
      if (a >= 'a')
        a -= 'a' - 'A';
      if (a >= 'A')
        a -= ('A' - 10);
      else
        a -= '0';
      if (b >= 'a')
        b -= 'a' - 'A';
      if (b >= 'A')
        b -= ('A' - 10);
      else
        b -= '0';
      *dst++ = 16 * a + b;
      src += 3;
    } else if (*src == '+') {
      *dst++ = ' ';
      src++;
    } else {
      *dst++ = *src++;
    }
  }
  *dst++ = '\0';
}

static esp_err_t cp_get_handler(httpd_req_t *req) {
  const char *html =
      "<html><head><meta name=\"viewport\" content=\"width=device-width, "
      "initial-scale=1\">"
      "<style>body{font-family:sans-serif;padding:20px;max-width:400px;margin:"
      "auto;} "
      "input{margin-bottom:15px;padding:10px;width:100%;box-sizing:border-box;}"
      " "
      "input[type=submit]{background:#007BFF;color:white;border:none;font-"
      "weight:bold;cursor:pointer;}</style>"
      "</head><body><h2>WiSense Setup</h2>"
      "<form action=\"/post\" method=\"post\">"
      "<label>Wi-Fi Name (SSID):</label><br><input name=\"s\"><br>"
      "<label>Password:</label><br><input name=\"p\" type=\"password\"><br>"
      "<label>Laptop IP Address:</label><br><input name=\"ip\" "
      "placeholder=\"e.g. 192.168.1.10\"><br>"
      "<input type=\"submit\" value=\"Connect\"></form></body></html>";
  httpd_resp_send(req, html, HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

static esp_err_t cp_post_handler(httpd_req_t *req) {
  char buf[256];
  int ret, remaining = req->content_len;
  if ((ret = httpd_req_recv(req, buf, MIN(remaining, sizeof(buf) - 1))) <= 0) {
    return ESP_FAIL;
  }
  buf[ret] = '\0';

  char ssid_raw[128] = {0};
  char pass_raw[128] = {0};
  char ip_raw[128] = {0};

  char *s_ptr = strstr(buf, "s=");
  char *p_ptr = strstr(buf, "&p=");
  char *ip_ptr = strstr(buf, "&ip=");

  if (s_ptr && p_ptr && ip_ptr) {
    s_ptr += 2;
    int s_len = p_ptr - s_ptr;
    strncpy(ssid_raw, s_ptr, s_len);

    p_ptr += 3;
    int p_len = ip_ptr - p_ptr;
    strncpy(pass_raw, p_ptr, p_len);

    strcpy(ip_raw, ip_ptr + 4);

    char decoded_ssid[32] = {0};
    char decoded_pass[64] = {0};
    char decoded_ip[32] = {0};
    urldecode2(decoded_ssid, ssid_raw);
    urldecode2(decoded_pass, pass_raw);
    urldecode2(decoded_ip, ip_raw);

    nvs_handle_t my_handle;
    if (nvs_open("storage", NVS_READWRITE, &my_handle) == ESP_OK) {
      nvs_set_str(my_handle, "ssid", decoded_ssid);
      nvs_set_str(my_handle, "pass", decoded_pass);
      if (strlen(decoded_ip) > 0) {
        nvs_set_str(my_handle, "host_ip", decoded_ip);
      }
      nvs_commit(my_handle);
      nvs_close(my_handle);
    }

    httpd_resp_send(
        req,
        "<html><head><meta name=\"viewport\" content=\"width=device-width, "
        "initial-scale=1\"></head>"
        "<body "
        "style=\"font-family:sans-serif;padding:20px;text-align:center;\">"
        "<h2>Saved!</h2><p>ESP32 is rebooting and connecting to the new "
        "network...</p></body></html>",
        HTTPD_RESP_USE_STRLEN);

    vTaskDelay(pdMS_TO_TICKS(1000));
    esp_restart();
  } else {
    httpd_resp_send(req, "Error parsing submission.", HTTPD_RESP_USE_STRLEN);
  }
  return ESP_OK;
}

static void start_captive_portal(void) {
  wifi_config_t ap_config = {
      .ap = {.ssid = "WiSense-Config",
             .ssid_len = strlen("WiSense-Config"),
             .channel = 1,
             .password = "",
             .max_connection = 4,
             .authmode = WIFI_AUTH_OPEN},
  };
  esp_wifi_set_mode(WIFI_MODE_APSTA);
  esp_wifi_set_config(WIFI_IF_AP, &ap_config);

  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  if (httpd_start(&server, &config) == ESP_OK) {
    httpd_uri_t get_uri = {.uri = "/",
                           .method = HTTP_GET,
                           .handler = cp_get_handler,
                           .user_ctx = NULL};
    httpd_uri_t post_uri = {.uri = "/post",
                            .method = HTTP_POST,
                            .handler = cp_post_handler,
                            .user_ctx = NULL};
    httpd_register_uri_handler(server, &get_uri);
    httpd_register_uri_handler(server, &post_uri);
    ESP_LOGI(TAG, "Captive portal started on 'WiSense-Config' AP");
  }
}

static void start_csi(void) {
  esp_wifi_set_ps(WIFI_PS_NONE);

  wifi_csi_config_t csi_config = {
      .lltf_en = true,
      .htltf_en = true,
      .stbc_htltf2_en = true,
      .ltf_merge_en = true,
      .channel_filter_en = false,
      .manu_scale = false,
      .shift = false,
  };
  esp_wifi_set_csi_config(&csi_config);
  esp_wifi_set_csi_rx_cb(wifi_csi_rx_cb, NULL);
  esp_wifi_set_csi(true);

  esp_wifi_set_promiscuous(true);
  esp_wifi_set_promiscuous_rx_cb(wifi_promiscuous_cb);
  wifi_promiscuous_filter_t filt = {.filter_mask =
                                        WIFI_PROMIS_FILTER_MASK_MGMT |
                                        WIFI_PROMIS_FILTER_MASK_DATA};
  esp_wifi_set_promiscuous_filter(&filt);
  esp_wifi_set_channel(CSI_WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);
}

static void event_handler(void *arg, esp_event_base_t event_base,
                          int32_t event_id, void *event_data) {
  if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
    esp_wifi_connect();
  } else if (event_base == WIFI_EVENT &&
             event_id == WIFI_EVENT_STA_DISCONNECTED) {
    if (s_retry_num < WIFI_MAXIMUM_RETRY) {
      esp_wifi_connect();
      s_retry_num++;
      ESP_LOGI(TAG, "Retry connecting to AP...");
    } else {
      ESP_LOGI(TAG,
               "Failed to connect after %d retries. Starting Captive Portal.",
               WIFI_MAXIMUM_RETRY);
      start_captive_portal();
    }
  } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
    s_retry_num = 0;
    ESP_LOGI(TAG, "Connected to AP successfully!");
    init_udp_socket();
    xTaskCreate(config_listener_task, "config_listener", 4096, NULL, 5, NULL);
    start_csi();
  }
}

void app_main(void) {
  nvs_flash_init();
  load_config_from_nvs();

  esp_netif_init();
  esp_event_loop_create_default();

  esp_netif_create_default_wifi_sta();
  esp_netif_create_default_wifi_ap();

  wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
  esp_wifi_init(&cfg);

  esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID,
                                      &event_handler, NULL, NULL);
  esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP,
                                      &event_handler, NULL, NULL);

  wifi_config_t wifi_config = {
      .sta =
          {
              .ssid = {0},
              .password = {0},
          },
  };
  strncpy((char *)wifi_config.sta.ssid, wifi_ssid,
          sizeof(wifi_config.sta.ssid) - 1);
  strncpy((char *)wifi_config.sta.password, wifi_pass,
          sizeof(wifi_config.sta.password) - 1);

  esp_wifi_set_mode(WIFI_MODE_STA);
  esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
  esp_wifi_start();

  while (1) {
    vTaskDelay(pdMS_TO_TICKS(10000));
  }
}

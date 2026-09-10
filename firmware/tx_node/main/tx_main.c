#include "esp_event.h"
#include "esp_log.h"
#include "esp_mac.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include <string.h>

static const char *TAG = "CSI_TX";
#define CSI_WIFI_CHANNEL 1
#define TX_RATE_HZ 100

static void tx_injection_task(void *pvParameters) {
  uint8_t raw_frame[24];
  memset(raw_frame, 0, sizeof(raw_frame));

  raw_frame[0] = 0x48; // Data, Null Data subtype
  raw_frame[1] = 0x00;
  memset(&raw_frame[4], 0xFF, 6);                 // Dest: Broadcast
  esp_read_mac(&raw_frame[10], ESP_MAC_WIFI_STA); // Src
  memset(&raw_frame[16], 0xFF, 6);                // BSSID: Broadcast

  const TickType_t xDelay = pdMS_TO_TICKS(1000 / TX_RATE_HZ);
  ESP_LOGI(TAG, "Starting raw frame injection at %d Hz on Channel %d",
           TX_RATE_HZ, CSI_WIFI_CHANNEL);

  while (1) {
    esp_wifi_80211_tx(WIFI_IF_STA, raw_frame, sizeof(raw_frame), false);
    vTaskDelay(xDelay);
  }
}

void app_main(void) {
  nvs_flash_init();
  esp_netif_init();
  esp_event_loop_create_default();
  esp_netif_create_default_wifi_sta();

  wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
  esp_wifi_init(&cfg);
  esp_wifi_set_storage(WIFI_STORAGE_RAM);
  esp_wifi_set_mode(WIFI_MODE_STA);
  esp_wifi_set_protocol(WIFI_IF_STA, WIFI_PROTOCOL_11N);
  esp_wifi_start();
  esp_wifi_config_80211_tx_rate(WIFI_IF_STA, WIFI_PHY_RATE_MCS0_LGI);
  esp_wifi_set_ps(WIFI_PS_NONE);

  esp_wifi_set_channel(CSI_WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);
  xTaskCreatePinnedToCore(tx_injection_task, "tx_injection", 4096, NULL, 5,
                          NULL, 1);
}

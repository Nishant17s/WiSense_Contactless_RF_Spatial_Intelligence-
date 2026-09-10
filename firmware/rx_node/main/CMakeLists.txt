idf_component_register(SRCS "rx_main.c"
                    INCLUDE_DIRS "."
                    REQUIRES esp_http_server nvs_flash lwip esp_wifi)

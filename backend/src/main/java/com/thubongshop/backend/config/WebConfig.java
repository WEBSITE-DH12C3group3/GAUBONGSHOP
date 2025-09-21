package com.thubongshop.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map URL /uploads/** đến thư mục uploads trên máy
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        //map brandimg
        registry.addResourceHandler("/brandimg/**")
                .addResourceLocations("file:brandimg/");
    }
}

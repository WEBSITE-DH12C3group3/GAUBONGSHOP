package com.thubongshop.backend.shop;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/shop")
public class ShopInfoController {

    @Value("${shop.origin.lat}")
    private double originLat;
    @Value("${shop.origin.lng}")
    private double originLng;
    @Value("${shop.origin.address:}")
    private String originAddress;

    @GetMapping("/origin")
    public Map<String,Object> origin(){
        return Map.of("lat", originLat, "lng", originLng, "address", originAddress);
    }
}

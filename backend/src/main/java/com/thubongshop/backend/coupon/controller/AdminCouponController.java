package com.thubongshop.backend.coupon.controller;

import com.thubongshop.backend.coupon.dto.CouponRequest;
import com.thubongshop.backend.coupon.dto.CouponResponse;
import com.thubongshop.backend.coupon.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/coupons")
@CrossOrigin(origins="*")
public class AdminCouponController {

    private final CouponService service;
    public AdminCouponController(CouponService service){ this.service = service; }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required=false) String q,
                                  @RequestParam(defaultValue="0") int page,
                                  @RequestParam(defaultValue="10") int size,
                                  @RequestParam(defaultValue="id,desc") String sort) {
        Pageable pageable = buildPageable(page,size,sort);
        Page<CouponResponse> data = service.list(q, pageable);
        Map<String,Object> resp = new HashMap<>();
        resp.put("items", data.getContent());
        resp.put("page", data.getNumber());
        resp.put("size", data.getSize());
        resp.put("totalPages", data.getTotalPages());
        resp.put("totalElements", data.getTotalElements());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id){
        return ResponseEntity.ok(Map.of("coupon", service.get(id)));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CouponRequest req){
        return ResponseEntity.ok(Map.of("coupon", service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody CouponRequest req){
        return ResponseEntity.ok(Map.of("coupon", service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok(Map.of("message","Deleted"));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<?> active(@PathVariable Integer id, @RequestParam boolean value){
        return ResponseEntity.ok(Map.of("coupon", service.setActive(id, value)));
    }

    private Pageable buildPageable(int page,int size,String sort){
        try{
            String[] sp = sort.split(",");
            String field = sp[0];
            Sort.Direction dir = (sp.length>1)? Sort.Direction.fromString(sp[1]) : Sort.Direction.DESC;
            return PageRequest.of(page,size,Sort.by(dir,field));
        }catch(Exception e){
            return PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"id"));
        }
    }
}

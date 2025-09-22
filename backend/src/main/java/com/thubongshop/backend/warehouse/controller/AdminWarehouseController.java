package com.thubongshop.backend.warehouse.controller;

import com.thubongshop.backend.warehouse.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/admin/warehouses")
public class AdminWarehouseController {
  private final WarehouseRepository repo;
  public AdminWarehouseController(WarehouseRepository repo){ this.repo=repo; }

  @GetMapping public List<Warehouse> all(){ return repo.findAll(); }
  @PostMapping public Warehouse create(@RequestBody Warehouse w){ w.setId(null); return repo.save(w); }
  @PutMapping("/{id}") public Warehouse update(@PathVariable Integer id, @RequestBody Warehouse w){ w.setId(id); return repo.save(w); }
}

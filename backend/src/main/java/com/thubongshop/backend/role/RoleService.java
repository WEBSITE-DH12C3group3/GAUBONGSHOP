package com.thubongshop.backend.role;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository repo;

    public List<Role> listAll() {
        return repo.findAll(Sort.by("id").ascending());
    }

    public Role create(String name) {
        if (repo.existsByName(name)) throw new IllegalArgumentException("Role name existed");
        Role r = new Role(); r.setName(name);
        return repo.save(r);
    }

    public Role rename(Long id, String name) {
        Role r = repo.findById(id).orElseThrow();
        r.setName(name);
        return repo.save(r);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}

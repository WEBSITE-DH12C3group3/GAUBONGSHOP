package com.thubongshop.backend.userrole;

import com.thubongshop.backend.role.Role;
import com.thubongshop.backend.role.RoleRepository;
import com.thubongshop.backend.user.User;
import com.thubongshop.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserRoleService {
  private final UserRepository userRepo;
  private final RoleRepository roleRepo;
  private final UserRoleRepository userRoleRepo;

  @Transactional
  public void addUserToRole(Long userId, Long roleId) {
    User u = userRepo.findById(userId).orElseThrow();
    Role r = roleRepo.findById(roleId).orElseThrow();
    if (!userRoleRepo.existsByUser_IdAndRole_Id(userId, roleId)) {
      userRoleRepo.save(UserRole.builder().user(u).role(r).build());
      // nếu UserRole không có @Builder thì dùng:
      // userRoleRepo.save(new UserRole(null, u, r));
    }
  }

  @Transactional
  public void removeUserFromRole(Long userId, Long roleId) {
    userRoleRepo.deleteByUser_IdAndRole_Id(userId, roleId);
  }

  // 👇 THÊM HÀM NÀY để làm việc với endpoint PUT /api/admin/user-roles/{userId}
  @Transactional
  public void setRolesForUser(Long userId, Set<Long> roleIds) {
    User u = userRepo.findById(userId).orElseThrow();

    // Xoá toàn bộ role hiện tại của user
    userRoleRepo.deleteByUser_Id(userId);

    if (roleIds == null || roleIds.isEmpty()) return;

    var roles = roleRepo.findAllById(roleIds);
    var links = new ArrayList<UserRole>(roles.size());
    for (Role r : roles) {
      links.add(UserRole.builder().user(u).role(r).build());
      // hoặc: links.add(new UserRole(null, u, r));
    }
    userRoleRepo.saveAll(links);
  }
}

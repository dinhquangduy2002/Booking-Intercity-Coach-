package com.booking_trip_be.service.impl;

import com.booking_trip_be.dto.AccountAndMessageDto;
import com.booking_trip_be.entity.Account;
import com.booking_trip_be.entity.Role;
import com.booking_trip_be.repository.IAccountRepo;
import com.booking_trip_be.repository.IMessageRepo;
import com.booking_trip_be.repository.IRoleRepo;
import com.booking_trip_be.service.IAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService implements IAccountService {
    @Autowired
    private IAccountRepo accountRepo;
    @Autowired
    private IRoleRepo roleRepo;
    @Autowired
    private IMessageRepo messageRepo;

    @Override
    public Account getById(int id) {
        return accountRepo.findById(id).get();
    }

    @Override
    public void edit(Account account) {
        accountRepo.save(account);
    }

    @Override
    public Optional<Account> getAccountById(int id) {
        return accountRepo.findById(id);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepo.findByUsername(username);
        List<GrantedAuthority> roles = new ArrayList<>();
        roles.add(account.getRole());
        return new User(account.getUsername(), account.getPassword(), roles);
    }

    @Override
    public Account getAccountLogin(String username, String password) {
        return accountRepo.getAccountLogin(username, password);
    }

    @Override
    public Account checkRegister(Account account) {
        Account account1 = accountRepo.findByUsername(account.getUsername());
        if (account1 != null || account.getPassword().isEmpty()) {
            return null;
        } else {
            Role role = roleRepo.findByName("ROLE_USER");
            account.setRole(role);
            account.setStatus("Đang hoạt động");
            return accountRepo.save(account);
        }
    }

    @Override
    public Account getAccountByUsername(String username) {
        return accountRepo.findByUsername(username);
    }

    @Override
    public Account getAccountByEmail(String email) {
        return accountRepo.findByEmail(email);
    }

    @Override
    public void save(Account account) {
        accountRepo.save(account);
    }

    @Override
    public List<Account> findAdmins() {
        return accountRepo.findByRoleName("ROLE_ADMIN");
    }


    @Override
    public Page<Account> findByRoleName(String roleName, Pageable pageable) {
        return accountRepo.findAllByRoleName(roleName, pageable);
    }

    @Override
    public Page<Account> findByRoleNameAndUsernameContains( String roleName,String nameSearch, Pageable pageable) {
        return accountRepo.findByRoleNameAndUsernameContains( roleName, nameSearch, pageable);
    }

    @Override
    public Page<Account> findByRoleNameAndUsernameContainsAndStatus( String roleName,String nameSearch, String status, Pageable pageable) {
        return accountRepo.findByRoleNameAndUsernameContainsAndStatus(roleName, nameSearch, status, pageable);
    }

    @Override
    public Page<Account> findByRoleNameAndStatus(String roleName, String status, Pageable pageable) {
        return accountRepo.findByRoleNameAndStatus(roleName, status, pageable);
    }

    @Override
    public Page<Account> findRoleUser(String roleName, String nameSearch , String status, Pageable pageable) {
        return accountRepo.findRoleUser(roleName , nameSearch , status  ,pageable);
    }

    @Override
    public List<AccountAndMessageDto> listUserAndUnreadMessage(int userId) {
        List<Account> accounts = accountRepo.listUserMessage(userId);
        List<AccountAndMessageDto> list = new ArrayList<>();
        for (Account account : accounts){
            int count = messageRepo.countUnreadMessagesByAccountLoginIdAndSenderId(userId, account.getId());
            list.add(new AccountAndMessageDto(account, count));
        }
        return list;
    }

    @Override
    public List<Account> findAllByUsernameContainsAndNotAccountLogin(String username, int accountId) {
        return accountRepo.findAllByUsernameContainsAndNotAccountLogin(username, accountId);
    }

    @Override
    public boolean checkBlockAccount(int accountId) {
        return accountRepo.findByIdAndStatus(accountId, "Bị khóa") != null;
    }
    @Override
    public Page<Account> findOwner(String roleName,String nameSearch,String status, Pageable pageable){
        return accountRepo.findOwner(roleName , nameSearch , status , pageable);
    }

}

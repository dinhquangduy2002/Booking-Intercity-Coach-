package com.booking_trip_be.service;


import com.booking_trip_be.dto.AccountAndMessageDto;
import com.booking_trip_be.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Optional;

public interface IAccountService extends UserDetailsService {
    void edit(Account account);

    Account getById(int id);

    Optional<Account> getAccountById(int id);

    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;

    Account getAccountLogin(String username, String password);

    Account checkRegister(Account account);

    Account getAccountByUsername(String username);

    Account getAccountByEmail(String email);

    void save(Account account);

    List<Account> findAdmins();

    Page<Account> findByRoleName(String roleName, Pageable pageable);

    Page<Account> findByRoleNameAndUsernameContains( String roleName,String nameSearch, Pageable pageable);

    Page<Account> findByRoleNameAndUsernameContainsAndStatus(String roleName,String nameSearch,  String status, Pageable pageable);

    Page<Account> findByRoleNameAndStatus(String roleName, String status, Pageable pageable);


    Page<Account> findRoleUser( String roleName , String nameSearch , String status , Pageable pageable);

    List<AccountAndMessageDto> listUserAndUnreadMessage(int userId);
    List<Account> findAllByUsernameContainsAndNotAccountLogin(String username, int accountId);

    boolean checkBlockAccount(int accountId);
    Page<Account> findOwner(String roleName,String nameSearch,String status, Pageable pageable);
}

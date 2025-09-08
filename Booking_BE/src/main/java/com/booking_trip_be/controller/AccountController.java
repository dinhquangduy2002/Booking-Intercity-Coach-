package com.booking_trip_be.controller;

import com.booking_trip_be.entity.Account;
import com.booking_trip_be.entity.Owner;
import com.booking_trip_be.entity.Role;
import com.booking_trip_be.repository.IRoleRepo;
import com.booking_trip_be.service.IAccountService;
import com.booking_trip_be.service.IOwnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/accounts")
public class AccountController {
    @Autowired
    private IAccountService accountService;

    @Autowired
    private IOwnerService ownerService;

    @Autowired
    private IRoleRepo roleRepo;

    @GetMapping("/admins")
    public List<Account> findAdmins() {
        return accountService.findAdmins();
    }



    @GetMapping("/getAccountByRole")
    public Page<Account> getAllAccount(@RequestParam("roleName") String roleName,
                                       @RequestParam("nameSearch") String nameSearch,
                                       @RequestParam("status") String status,
                                       @RequestParam(value = "page", defaultValue = "0") int page,
                                       @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable;
        pageable = PageRequest.of(page, size);
        if (!status.equals("ALL") && !nameSearch.trim().equals(""))
            return accountService.findOwner(roleName, nameSearch, status, pageable);
        else if (!status.equals("ALL"))
            return accountService.findByRoleNameAndStatus(roleName, status, pageable);
        else if (!nameSearch.trim().equals(""))
            return accountService.findByRoleNameAndUsernameContains(roleName, nameSearch, pageable);

        else
            return accountService.findByRoleName(roleName, pageable);
    }

    @GetMapping("/getById/{id}")
    public Account getById(@PathVariable int id) {
        return accountService.getById(id);
    }

    @PutMapping("/{id}")
    public Account edit(@PathVariable int id, @RequestBody Account accountEdit) {
        Account account = accountService.getById(id);
        account.setFirstname(accountEdit.getFirstname());
        account.setLastname(accountEdit.getLastname());
        account.setAddress(accountEdit.getAddress());
        account.setProvince(accountEdit.getProvince());
        account.setDistrict(accountEdit.getDistrict());
        account.setWard(accountEdit.getWard());
        account.setEmail(accountEdit.getEmail());
        account.setPhone(accountEdit.getPhone());
        account.setAvatar(accountEdit.getAvatar());
        accountService.edit(account);
        return account;
    }

    @GetMapping("/getAccountById")
    public ResponseEntity<Optional<Account>> getAccountById(@RequestParam int id) {
        return new ResponseEntity<>(accountService.getAccountById(id), HttpStatus.OK);
    }

    @GetMapping("/{username}")
    public ResponseEntity<Account> getAccountByUserName(@PathVariable String username) {
        return new ResponseEntity<>(accountService.getAccountByUsername(username), HttpStatus.OK);
    }

    @PutMapping("/changePassword/{id}")
    public Account changePassword(@RequestBody Account accountEdit) {
        Account account = accountService.getById(accountEdit.getId());
        account.setPassword(accountEdit.getPassword());
        accountService.edit(account);
        return account;
    }

    @PostMapping("/checkPassword/{id}")
    public boolean checkPassword(@PathVariable int id, @RequestBody Account accountEdit) {
        Account account = accountService.getById(id);
        if (account.getPassword().equals(accountEdit.getPassword())) {
            return true;
        } else {
            return false;
        }
    }

    @PostMapping("/registerOwner")
    public ResponseEntity<?> registerOwner(@RequestBody Owner owner) {
        Owner ownerCheck = ownerService.getOwnerByAccount(owner.getAccount().getId());
        if (ownerCheck != null) {
            owner.setId(ownerCheck.getId());
        }
        ownerService.save(owner);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/getByAccount/{idAccount}")
    public ResponseEntity<?> getByIdAccount(@PathVariable int idAccount) {
        Owner owner = ownerService.getOwnerByAccount(idAccount);
        Owner owner1 = new Owner(owner.getStatus());
        return new ResponseEntity(owner1, HttpStatus.OK);
    }

    @GetMapping("/getRegisterOwner")
    public ResponseEntity<?> getRegisterOwner() {
        return new ResponseEntity<>(ownerService.getAllByStatus("Chờ xác nhận"), HttpStatus.OK);
    }

    @PostMapping("/agreeRegister")
    public ResponseEntity<?> agreeRegister(@RequestBody Owner owner) {
        ownerService.save(owner);
        Role role = roleRepo.findByName("ROLE_OWNER");
        Account account = new Account(owner.getAccount().getId(), owner.getAccount().getUsername(), owner.getAccount().getPassword(), owner.getFirstname(), owner.getLastname(), owner.getAddress(), owner.getProvince(),
                owner.getDistrict(), owner.getWard(), owner.getEmail(), owner.getPhone(), owner.getAvatar(), owner.getAccount().getWallet(), owner.getAccount().getStatus(), role);
        accountService.save(account);
        return new ResponseEntity<>("Xác nhận thành công", HttpStatus.OK);
    }

    @GetMapping("/refuseRegister/{idOwner}")
    public ResponseEntity<?> refuseRegister(@PathVariable int idOwner) {
        Owner owner = ownerService.findOwnerById(idOwner);
        owner.setStatus("Bị từ chối");
        ownerService.save(owner);
        return new ResponseEntity<>("Từ chối thành công", HttpStatus.OK);
    }

    @GetMapping("/unBlock/{accId}")
    public ResponseEntity<?> unBlockAccount(@PathVariable int accId) {
        Account account = accountService.getById(accId);
        account.setStatus("Đang hoạt động");
        accountService.save(account);
        return new ResponseEntity<>("Mở khóa tài khoản thành công", HttpStatus.OK);
    }

    @GetMapping("/block/{accId}")
    public ResponseEntity<?> blockAccount(@PathVariable int accId) {
        Account account = accountService.getById(accId);
        account.setStatus("Bị khóa");
        accountService.save(account);
        return new ResponseEntity<>("Khóa tài khoản thành công", HttpStatus.OK);
    }
    @GetMapping("/getUser")
    public Page<Account> getUser(@RequestParam("roleName") String roleName,
                                 @RequestParam("status") String status,
                                       @RequestParam("nameSearch") String nameSearch,
                                       @RequestParam(value = "page", defaultValue = "0") int page,
                                       @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable;
        String sortBy = "id";
        Sort sort = Sort.by(Sort.Order.asc(sortBy));
        pageable = PageRequest.of(page, size , sort);
        return  accountService.findRoleUser(roleName , nameSearch , status , pageable);
    }


    @GetMapping("/{accountId}/messages")
    public ResponseEntity<?> listUserAndUnreadMessage(@PathVariable int accountId) {
        try {
            return ResponseEntity.ok(accountService.listUserAndUnreadMessage(accountId));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @GetMapping("/{accountId}/messages/search")
    public ResponseEntity<?> findAllByUsernameContainsAndNotAccountLogin(@PathVariable int accountId,
                                                                         @RequestParam("username") String username) {
        try {
            return ResponseEntity.ok(accountService.findAllByUsernameContainsAndNotAccountLogin(username, accountId));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }

    @GetMapping("/check-block/{accountId}")
    public ResponseEntity<?> checkBlockAccount(@PathVariable int accountId) {
        try {
            return ResponseEntity.ok(accountService.checkBlockAccount(accountId));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
        }
    }
}

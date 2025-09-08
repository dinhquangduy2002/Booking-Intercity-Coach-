package com.booking_trip_be.service.impl;

import com.booking_trip_be.entity.Account;
import com.booking_trip_be.entity.Role;
import com.booking_trip_be.repository.IAccountRepo;
import com.booking_trip_be.repository.IRoleRepo;
import com.booking_trip_be.service.IInitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class InitService implements IInitService {
    @Autowired
    private IRoleRepo roleRepo;
    @Autowired
    private IAccountRepo accountRepo;
    @Override
    public void initData() {
        Role user = roleRepo.save(new Role("ROLE_USER"));
        Role owner = roleRepo.save(new Role("ROLE_OWNER"));
        Role admin = roleRepo.save(new Role("ROLE_ADMIN"));
        Account admin1 = new Account("admin1", "123", "admin1@gmail.com", "0999888888", "https://genzrelax.com/wp-content/uploads/2022/03/anh-dai-dien-dep-4.jpg", "Đang hoạt động", admin);
        Account admin2 = new Account("admin2", "123", "admin2@gmail.com", "0999777777", "https://i.pinimg.com/736x/24/21/85/242185eaef43192fc3f9646932fe3b46.jpg", "Đang hoạt động", admin);
        Account admin3 = new Account("admin3", "123", "admin3@gmail.com","0999666666", "https://www.oca.edu.vn/uploads/images/info/anh-dai-dien-trong-tieng-trung-la-gi.png", "Đang hoạt động", admin);
        Account admin4 = new Account("admin4", "123", "admin4@gmail.com","0999555555", "https://inkythuatso.com/uploads/thumbnails/800/2022/03/hinh-dai-dien-cute-cho-con-trai-41-28-16-27-32.jpg", "Đang hoạt động", admin);
        accountRepo.saveAll(Arrays.asList(admin1, admin2, admin3, admin4));
    }
}

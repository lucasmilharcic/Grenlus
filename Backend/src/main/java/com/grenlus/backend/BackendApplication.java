package com.grenlus.backend;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(
            TimeZone.getTimeZone("America/Argentina/Buenos_Aires")
        );

        SpringApplication.run(BackendApplication.class, args);
    }
}
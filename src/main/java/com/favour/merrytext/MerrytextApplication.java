package com.favour.merrytext;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MerrytextApplication {

	public static void main(String[] args) {
		SpringApplication.run(MerrytextApplication.class, args);
		System.out.println("Server started on port 8081");
	}

}

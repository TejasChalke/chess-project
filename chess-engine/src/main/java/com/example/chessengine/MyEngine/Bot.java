package com.example.chessengine.MyEngine;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class Bot {

    @CrossOrigin("http://localhost:3000")
    @PostMapping("/getmove")
    ResponseEntity<String> getMove(@RequestBody MyRequestBody body){
        System.out.println(body.pieces);

        return ResponseEntity.ok("test");
    }
}

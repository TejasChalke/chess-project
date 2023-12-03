package com.example.chessengine.API;

import com.example.chessengine.MyEngine.Bot;
import com.example.chessengine.MyEngine.MyRequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class EngineServer {

    Bot bot;
    @CrossOrigin("*")
    @GetMapping("/setboard")
    ResponseEntity<String> setBoard(){
        bot = new Bot();

        return ResponseEntity.ok("test");
    }

    @CrossOrigin("http://localhost:3000")
    @PostMapping("/getmove")
    ResponseEntity<String> getMove(@RequestBody MyRequestBody body){
        System.out.println(body.pieces);

        return ResponseEntity.ok("test");
    }
}

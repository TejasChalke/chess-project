package com.example.chessengine.MyEngine;

public class BoardUtility {
    static int indexFromNotation(String str){
        int rank = (str.charAt(0) - 'a'), file = (str.charAt(1) - '0') - 1;
        return rank * 8 + file;
    }
}

package com.example.chessengine.MyEngine;

public class BoardUtility {

    static int a1 = 0, b1 = 1, c1 = 2, d1 = 3, e1 = 4, f1 = 5, g1 = 6, h1 = 7;
    static int a8 = 56, b8 = 57, c8 = 58, d8 = 59, e8 = 60, f8 = 61, g8 = 62, h8 = 63;

    static boolean overlapingSquares(long mask, int square){
        return ((mask >> square) & 1) != 0;
    }

    static int indexFromNotation(String str){
        int file = (str.charAt(0) - 'a'), rank = (str.charAt(1) - '0') - 1;
        return rank * 8 + file;
    }

    static int fileFromNotation(String str){
        return (str.charAt(0) - 'a');
    }

    static int rankFromNotation(String str){
        return (str.charAt(1) - '0') - 1;
    }

    static void displayPosition(int[] squares, long attackMask){
        for(int i=7; i>=0; i--){
            for(int j=0; j<8; j++){
                System.out.printf("%4d", squares[i * 8 + j] );
            }
            System.out.println();
        }

        System.out.println();
        System.out.println("-----------------------------------------");
        System.out.println();

        for(int i=7; i>=0; i--){
            for(int j=0; j<8; j++){
                if(BoardUtility.overlapingSquares(attackMask, i * 8 + j)) System.out.printf("%4d", -1);
                else System.out.printf("%4d", squares[i * 8 + j] );
            }
            System.out.println();
        }

        System.out.println();
        System.out.println("-----------------------------------------");
        System.out.println();
    }
}

package com.example.chessengine.MyEngine;

import java.lang.reflect.Array;
import java.util.Arrays;

public class PieceList {
    int[] map;
    int[] occupiedSquares;
    public int count;

    PieceList(){
        count = 0;
        map = new int[64];
        occupiedSquares = new int[11];
        Arrays.fill(map, -1);
        Arrays.fill(occupiedSquares, -1);
    }
    PieceList(int size){
        count = 0;
        map = new int[64];
        occupiedSquares = new int[size];
        Arrays.fill(map, -1);
        Arrays.fill(occupiedSquares, -1);
    }

    public void addPiece(int square){
        occupiedSquares[count] = square;
        map[square] = count;
        count++;
    }

    public void removePiece(int square){
        int index = map[square];
        occupiedSquares[index] = occupiedSquares[count - 1];
        map[occupiedSquares[index]] = index;
        map[square] = -1;
        occupiedSquares[count - 1] = -1;
        count--;
    }

    public void movePiece(int from, int to){
        int index = map[from];
        occupiedSquares[index] = to;
        map[to] = index;
    }
}

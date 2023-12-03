package com.example.chessengine.MyEngine;

public class PieceList {
    int[] map;
    int[] occupiedSquares;
    int count;

    PieceList(){
        count = 0;
        map = new int[64];
        occupiedSquares = new int[11];
    }
    PieceList(int size){
        count = 0;
        map = new int[64];
        occupiedSquares = new int[size];
    }

    public void addPiece(int square){
        occupiedSquares[count] = square;
        map[square] = count;
        count++;
    }

    public void removePiece(int square){
        int index = map[square];
        occupiedSquares[index] = occupiedSquares[count - 1];
        map[occupiedSquares[count - 1]] = index;
        count--;
    }

    public void movePiece(int from, int to){
        int index = map[from];
        occupiedSquares[index] = to;
        map[to] = index;
    }
}

package com.example.chessengine.MyEngine;

import java.util.HashMap;

public class FENUtility {
    static int[] getPieces;
    static String startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    static {
        getPieces = new int[26];

        getPieces['k' - 'a'] = Pieces.King;
        getPieces['q' - 'a'] = Pieces.Queen;
        getPieces['r' - 'a'] = Pieces.Rook;
        getPieces['b' - 'a'] = Pieces.Bishop;
        getPieces['n' - 'a'] = Pieces.Knight;
        getPieces['p' - 'a'] = Pieces.Pawn;
    }
    static LoadData loadSquares(String fen){
        String[] arr = fen.split(" ");

        int currentBoardState = 0;
        int[] squares = new int[64];
        PieceList[] pawns, knights, bishops, rooks, queens;
        int[] kingIndex = new int[2];
        boolean whiteToMove = false;

        knights = new PieceList[] { new PieceList (10), new PieceList (10) };
        pawns = new PieceList[] { new PieceList (8), new PieceList (8) };
        rooks = new PieceList[] { new PieceList (10), new PieceList (10) };
        bishops = new PieceList[] { new PieceList (10), new PieceList (10) };
        queens = new PieceList[] { new PieceList (9), new PieceList (9) };

        int rank = 7, file = 0, color, piece, index;

        for(char c: arr[0].toCharArray()){
            if(c == '/'){
                rank--;
                file = 0;
            }else{
                if(Character.isDigit(c)){
                    file += (c - '0');
                }else{
                    color = Character.isUpperCase(c) ? Pieces.White : Pieces.Black;
                    index = rank * 8 + file;
                    squares[index] = getPieces[Character.toLowerCase(c) - 'a'] | color;
                    piece = squares[index];

                    if(Pieces.isKing(piece)){
                        if(Pieces.isWhite(piece)) kingIndex[0] = index;
                        else kingIndex[1] = index;
                    }

                    else if(Pieces.isPawn(piece)){
                        if(Pieces.isWhite(piece)) pawns[0].addPiece(index);
                        else pawns[1].addPiece(index);
                    }

                    else if(Pieces.isQueen(piece)){
                        if(Pieces.isWhite(piece)) queens[0].addPiece(index);
                        else queens[1].addPiece(index);
                    }

                    else if(Pieces.isRook(piece)){
                        if(Pieces.isWhite(piece)) rooks[0].addPiece(index);
                        else rooks[1].addPiece(index);
                    }

                    else if(Pieces.isBishop(piece)){
                        if(Pieces.isWhite(piece)) bishops[0].addPiece(index);
                        else bishops[1].addPiece(index);
                    }

                    else if(Pieces.isKnight(piece)){
                        if(Pieces.isWhite(piece)) knights[0].addPiece(index);
                        else knights[1].addPiece(index);
                    }

                    file++;
                }
            }
        }

        if(arr.length > 1 && arr[1].equals("w")) whiteToMove = true;

        if(arr.length > 2) {
            if (arr[2].indexOf('K') != -1) currentBoardState |= 1;
            if (arr[2].indexOf('Q') != -1) currentBoardState |= 2;
            if (arr[2].indexOf('k') != -1) currentBoardState |= 4;
            if (arr[2].indexOf('q') != -1) currentBoardState |= 8;
        }

        if(arr.length > 3 && !arr[3].equals("-")){
            int epSquare = BoardUtility.indexFromNotation(arr[3]);
            currentBoardState |= (epSquare << 4);
        }

        LoadData data = new LoadData();
        data.squares = squares;
        data.currentBoardState = currentBoardState;
        data.whiteToMove = whiteToMove;
        data.kingIndex = kingIndex;
        data.pawnPieces = pawns;
        data.queenPieces = queens;
        data.rookPieces = rooks;
        data.bishopPieces = bishops;
        data.knightPieces = knights;

        return data;
    }
}

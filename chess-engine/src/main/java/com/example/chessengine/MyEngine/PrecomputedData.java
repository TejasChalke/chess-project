package com.example.chessengine.MyEngine;

import java.util.ArrayList;
import java.util.List;

public class PrecomputedData {
    // first four are orthogonal
    // last four are diagonal
    static final byte[] moveDir = new byte[] {8, -8, 1, -1, 9, -9, 7, -7};

    // distance from a particular square to a direction
    static int[][] distanceToEdge;

    // squares that the pawn attacks
    // square, attackedSquares
    static int[][] whitePawnAttackSquares, blackPawnAttackSquares;
    static long[][] pawnAttackMask;
    // refers to index in moveDir
    static int[][] pawnAttackDir = new int[][] {
            new int[] {4, 6},
            new int[] {5, 7}
    };

    static int[][] knightAttackSquares;
    static long[] knightAttackMask;

    static int[][] kingAttackSquares;
    static long[] kingAttackMask;

    static long[] rookMoves, bishopMoves, queenMoves;

    static {
        distanceToEdge = new int[64][8];
        int[] allKnightJumps = { 15, 17, -17, -15, 10, -6, 6, -10 };
        knightAttackSquares = new int[64][];
        knightAttackMask = new long[64];

        kingAttackSquares = new int[64][];
        kingAttackMask = new long[64];

        whitePawnAttackSquares = new int[64][];
        blackPawnAttackSquares = new int[64][];
        pawnAttackMask = new long[64][];

        for (int squareIndex = 0; squareIndex < 64; squareIndex++) {

            int y = squareIndex / 8;
            int x = squareIndex - y * 8;

            int north = 7 - y;
            int south = y;
            int west = x;
            int east = 7 - x;

            distanceToEdge[squareIndex][0] = north;
            distanceToEdge[squareIndex][1] = south;
            distanceToEdge[squareIndex][2] = west;
            distanceToEdge[squareIndex][3] = east;
            distanceToEdge[squareIndex][4] = Math.min(north, west);
            distanceToEdge[squareIndex][5] = Math.min(south, east);
            distanceToEdge[squareIndex][6] = Math.min(north, east);
            distanceToEdge[squareIndex][7] = Math.min(south, west);

            // knight moves
            List<Integer> legalKnightJumps = new ArrayList<Integer>();
            long knightBitboard = 0;

            for (int knightJumpDelta : allKnightJumps) {
                int knightJumpSquare = squareIndex + knightJumpDelta;

                if (knightJumpSquare >= 0 && knightJumpSquare < 64) {
                    int knightSquareY = knightJumpSquare / 8;
                    int knightSquareX = knightJumpSquare - knightSquareY * 8;
                    // Ensure knight has moved max of 2 squares on x/y axis (to reject indices that have wrapped around side of board)
                    int maxCoordMoveDst = Math.max(Math.abs(x - knightSquareX), Math.abs(y - knightSquareY));

                    if (maxCoordMoveDst == 2) {
                        legalKnightJumps.add(knightJumpSquare);
                        knightBitboard |= 1L << knightJumpSquare;
                    }
                }
            }

            knightAttackMask[squareIndex] = knightBitboard;
            knightAttackSquares[squareIndex] = new int[legalKnightJumps.size()];
            for(int j=0; j<legalKnightJumps.size(); j++)
                knightAttackSquares[squareIndex][j] = legalKnightJumps.get(j);

            // king moves
            List<Integer> legalKingMoves = new ArrayList<Integer>();
            for(int kingMoveDelta : moveDir) {
                int kingMoveSquare = squareIndex + kingMoveDelta;

                if (kingMoveSquare >= 0 && kingMoveSquare < 64) {
                    int kingSquareY = kingMoveSquare / 8;
                    int kingSquareX = kingMoveSquare - kingSquareY * 8;
                    // Ensure king has moved max of 1 square on x/y axis (to reject indices that have wrapped around side of board)
                    int maxCoordMoveDst = Math.max(Math.abs(x - kingSquareX), Math.abs(y - kingSquareY));

                    if (maxCoordMoveDst == 1) {
                        legalKingMoves.add(kingMoveSquare);
                        kingAttackMask[squareIndex] |= 1L << kingMoveSquare;
                    }
                }
            }

            kingAttackSquares[squareIndex] = new int[legalKingMoves.size()];
            for(int j=0; j<legalKingMoves.size(); j++)
                kingAttackSquares[squareIndex][j] = legalKingMoves.get(j);

            // pawn moves
            List<Integer> pawnCapturesWhite = new ArrayList<>();
            List<Integer> pawnCapturesBlack = new ArrayList<>();
            pawnAttackMask[squareIndex] = new long[2];

            if (x > 0) {
                if (y < 7) {
                    pawnCapturesWhite.add(squareIndex + 7);
                    pawnAttackMask[squareIndex][Board.whiteIndex] |= 1L << (squareIndex + 7);
                }
                if (y > 0) {
                    pawnCapturesBlack.add(squareIndex - 9);
                    pawnAttackMask[squareIndex][Board.blackIndex] |= 1L << (squareIndex - 9);
                }
            }
            if (x < 7) {
                if (y < 7) {
                    pawnCapturesWhite.add(squareIndex + 9);
                    pawnAttackMask[squareIndex][Board.whiteIndex] |= 1L << (squareIndex + 9);
                }
                if (y > 0) {
                    pawnCapturesBlack.add(squareIndex - 7);
                    pawnAttackMask[squareIndex][Board.blackIndex] |= 1L << (squareIndex - 7);
                }
            }

            whitePawnAttackSquares[squareIndex] = new int[pawnCapturesWhite.size()];
            for(int j=0; j<pawnCapturesWhite.size(); j++)
                whitePawnAttackSquares[squareIndex][j] = pawnCapturesWhite.get(j);

            blackPawnAttackSquares[squareIndex] = new int[pawnCapturesBlack.size()];
            for(int j=0; j<pawnCapturesBlack.size(); j++)
                blackPawnAttackSquares[squareIndex][j] = pawnCapturesBlack.get(j);

            // Rook moves
            for (int directionIndex = 0; directionIndex < 4; directionIndex++) {
                int currentDirOffset = moveDir[directionIndex];
                for (int n = 0; n < distanceToEdge[squareIndex][directionIndex]; n++) {
                    int targetSquare = squareIndex + currentDirOffset * (n + 1);
                    rookMoves[squareIndex] |= 1L << targetSquare;
                }
            }

            // Bishop moves
            for (int directionIndex = 4; directionIndex < 8; directionIndex++) {
                int currentDirOffset = moveDir[directionIndex];
                for (int n = 0; n < distanceToEdge[squareIndex][directionIndex]; n++) {
                    int targetSquare = squareIndex + currentDirOffset * (n + 1);
                    bishopMoves[squareIndex] |= 1L << targetSquare;
                }
            }

            queenMoves[squareIndex] = rookMoves[squareIndex] | bishopMoves[squareIndex];
        }
    }
}

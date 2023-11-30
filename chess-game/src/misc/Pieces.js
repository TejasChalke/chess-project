export default class Pieces{
    static None = 0;
    static King = 1;
    static Pawn = 2;
    static Bishop = 3;
    static Knight = 4;
    static Rook = 5;
    static Queen = 6;

    static White = 8;
    static Black = 16;

    static getColor(piece){
        return (piece & 24);
    }

    static isWhite(piece){
        return (piece & 24) === this.White
    }

    static isBlack(piece){
        return (piece & 24) === this.Black
    }

    static isKing(piece){
        return (piece & 7) === this.King
    }

    static isPawn(piece){
        return (piece & 7) === this.Pawn
    }

    static isQueen(piece){
        return (piece & 7) === this.Queen
    }

    static isRook(piece){
        return (piece & 7) === this.Rook
    }

    static isBishop(piece){
        return (piece & 7) === this.Bishop
    }

    static isKnight(piece){
        return (piece & 7) === this.Knight
    }

    static isNone(piece){
        return piece === this.None;
    }

    static charToImage = new Map([
        ['n', "BlackKnight"],
        ['q', "BlackQueen"],
        ['b', "BlackBishop"],
        ['r', "BlackRook"],
        ['k', "BlackKing"],
        ['p', "BlackPawn"],
        ['Q', "WhiteQueen"],
        ['N', "WhiteKnight"],
        ['B', "WhiteBishop"],
        ['R', "WhiteRook"],
        ['K', "WhiteKing"],
        ['P', "WhitePawn"]
    ]);

    static charToNumber = new Map([
        ['n', this.Black | this.Knight],
        ['q', this.Black | this.Queen],
        ['b', this.Black | this.Bishop],
        ['r', this.Black | this.Rook],
        ['k', this.Black | this.King],
        ['p', this.Black | this.Pawn],
        ['Q', this.White | this.Queen],
        ['N', this.White | this.Knight],
        ['B', this.White | this.Bishop],
        ['R', this.White | this.Rook],
        ['K', this.White | this.King],
        ['P', this.White | this.Pawn]
    ]);

    static isSameColor(piece, currPlayer) {
        piece &= 24;

        return (currPlayer & piece) !== 0;
    }
}
function LineEquation(x, y, x1, y1) {
    let m, b;
    m = x1 !== x ? (y1 - y) / (x1 - x) : 0;
    b = x1 !== x ? y - m * x : x;

    return [m, b];
}

function shortestDistanceFromPointToLine(x, y, x1, y1, a, b) {
    let lineEq = LineEquation(x, y, x1, y1);
    let dis = Math.abs(lineEq[0] * a - b + lineEq[1]) / Math.sqrt(Math.pow(lineEq[0], 2) + 1);

    return dis;
}

function euclidienDistane(p1, p2) {
    let firstIteration = Math.pow((p2.x - p1.x), 2);
    let secondIteration = Math.pow((p2.y - p1.y), 2);

    return Math.sqrt(firstIteration + secondIteration);
}

function distancePointLine(p, line) {
    return Math.abs(p - line);
}

export {
    shortestDistanceFromPointToLine,
    euclidienDistane,
    distancePointLine
}

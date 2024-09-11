function BackwardDirichletStep(matrix, j, gamma) {
    let n = matrix[0].length - 2;
    let A = new Array(n).fill(0).map(() => Array(n).fill(0));
    let b = new Array(n).fill(550);

    for (let i = 0; i < n; i++) {
        A[i][i] = 1 + 2*gamma;
        b[i] = matrix[j-1][i+1];
    }
    for (let i = 0; i < n - 1; i++) {
        A[i][i+1] = -gamma;
        A[i+1][i] = -gamma;
    }

    b[0] += gamma*matrix[j-1][0];
    b[n-1] += gamma*matrix[j-1][n+1];

    for (let i = 1; i < n; i++) {
        let factor = A[i][i-1] / A[i-1][i-1];
        A[i][i] -= factor*A[i-1][i];
        b[i] -= factor*b[i-1];
    }
    let X = new Array(n).fill(0);
    X[n-1] = b[n-1] / A[n-1][n-1];
    for (let i = n - 2; i >= 0; i--) {
        X[i] = (b[i] - A[i][i+1] * X[i+1]) / A[i][i];
    }

    for (let i = 0; i < n; i++) {
        matrix[j][i+1] = X[i];
    }
    matrix[j][0] = matrix[j-1][0];
    matrix[j][n+1] = matrix[j-1][n+1];
}

function BackwardDirichlet(temp, dt, n, alpha) {
    let m = temp.length;
    let matrix = new Array(n).fill(0).map(() => new Array(m).fill(0));
    let dx = 100/(m - 1);
    let gamma = alpha*dt/(Math.pow(dx, 2));
    for (let i = 0; i < m; i++)
        matrix[0][i] = 100-temp[i];
    for (let i = 1; i < n; i++) {
        matrix[i][0] = 100-temp[0];
        matrix[i][m-1] = 100-temp[m-1];
    }
    for (let i = 1; i < n; i++) {
        BackwardDirichletStep(matrix, i, gamma);
    }
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            matrix[i][j] = Math.round(matrix[i][j]*1000)/1000
        }
    }
    return matrix;
}

let ForwardDirichlet = function(temp, dt, n, alpha) {
    let m = temp.length;
    let matrix = new Array(n).fill(0).map(() => new Array(m).fill(0));
    let dx = 100/(m - 1);
    let gamma = alpha*dt/(Math.pow(dx, 2));
    for (let i = 0; i < m; i++)
        matrix[0][i] = 100-temp[i];
    for (let i = 1; i < n; i++) {
        matrix[i][0] = 100-temp[0];
        matrix[i][m-1] = 100-temp[m-1];
    }
    for (let i = 1; i < n; i++) {
        for (let j = 1; j < m-1; j++) {
            matrix[i][j] = matrix[i-1][j];
            matrix[i][j] += gamma*(matrix[i-1][j-1] - 2*matrix[i-1][j] + matrix[i-1][j+1]);
        }
    }
    return matrix;
}

let Dirichlet = function(temp, dt, n, alpha) {
    let result_f = ForwardDirichlet(temp, dt, n, alpha);
    let result_b = BackwardDirichlet(temp, dt, n, alpha);

    let m = temp.length;
    let dx = 100/(m - 1);
    let gamma = alpha*dt/(Math.pow(dx, 2));
    if (gamma > 0.5) {
        return {stable: false, result: result_b};
    }
    for (let i = 0; i < result_f.length; i++) {
        for (let j = 0; j < result_f[0].length; j++) {
            result_f[i][j] = 0.5 * (result_f[i][j] + result_b[i][j]);
        }
    }
    return {stable: true, result: result_f};
}
export {Dirichlet}
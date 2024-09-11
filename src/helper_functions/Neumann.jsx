function BackwardNeumannStep(matrix, j, gamma) {
    let n = matrix[0].length;
    let A = new Array(n).fill(0).map(() => Array(n).fill(0));
    let b = new Array(n).fill(0);

    A[0][0] = 1 + gamma;
    A[n-1][n-1] = 1 + gamma;

    for (let i = 1; i < n - 1; i++) { A[i][i] = 1 + 2*gamma; }
    for (let i = 0; i < n - 1; i++) {
        A[i][i+1] = -gamma;
        A[i+1][i] = -gamma;
    }

    for (let i = 0; i < n; i++) { b[i] = matrix[j-1][i]; }

    for (let i = 1; i < n; i++) {
        let factor = A[i][i-1] / A[i-1][i-1];
        A[i][i] -= factor*A[i-1][i];
        b[i] -= factor*b[i-1];
    }
    for (let i = n - 2; i >= 0; i--) {
        let factor = A[i][i+1] / A[i+1][i+1];
        b[i] -= factor*b[i+1];
    }

    for (let i = 0; i < n; i++) {
        matrix[j][i] = b[i] / A[i][i];
    }
}

function BackwardNeumann(temp, dt, n, alpha) {
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
        BackwardNeumannStep(matrix, i, gamma);
    }
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            matrix[i][j] = Math.round(matrix[i][j]*1000)/1000
        }
    }
    return matrix;
}

const ForwardNeumann = function(temp, dt, n, alpha) {
    let m = temp.length;
    let matrix = new Array(n).fill(0).map(() => new Array(m).fill(0));
    let dx = 100/(m-1);
    let gamma = alpha*dt/(Math.pow(dx, 2));
    for (let i = 0; i < m; i++)
        matrix[0][i] = 100-temp[i];
    for (let i = 1; i < n; i++) {
        matrix[i][0] = 100-temp[0];
        matrix[i][m-1] = 100-temp[m-1];
    }
    for (let i = 1; i < n; i++) {
        matrix[i][0] = matrix[i-1][0];
        matrix[i][0] += gamma*(matrix[i-1][1] - matrix[i-1][0])
        for (let j = 1; j < m-1; j++) {
            matrix[i][j] = matrix[i-1][j];
            matrix[i][j] += gamma*(matrix[i-1][j-1] - 2*matrix[i-1][j] + matrix[i-1][j+1]);
        }
        matrix[i][m-1] = matrix[i-1][m-1];
        matrix[i][m-1] += gamma*(matrix[i-1][m-2] - matrix[i-1][m-1])
    }
    return matrix
}

let Neumann = function(temp, dt, n, alpha) {
    let result_f = ForwardNeumann(temp, dt, n, alpha);
    let result_b = BackwardNeumann(temp, dt, n, alpha);

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
export {Neumann}
export const MIN = -1000;
export const MAX = 1000;

function getBaseLog(value: number, base: number) {
  if (value <= base) return 1;
  return Math.log(value) / Math.log(base);
}

export const alphaBetaAlgorithm = (
  { depth, maximizingPlayer, nodeIndex, values, alpha = MIN, beta = MAX } :
  { 
    depth: number,
    maximizingPlayer: boolean,
    nodeIndex: number,
    values: [number, number][],
    alpha?: number,
    beta?: number,
  }
): [number, number] => {
  if (depth >= getBaseLog(values.length, 2)) {
    return values[nodeIndex];
  }

  if (maximizingPlayer) {
    let best = MIN;
    let bestIndex = 0;

    for (let i = 0; i < values.length; i++) {
      const [val, index] = alphaBetaAlgorithm({
        depth: depth + 1,
        nodeIndex: nodeIndex * 2 + i,
        maximizingPlayer: false,
        values,
        alpha,
        beta,
      });
      if (val > best) {
        best = val;
        bestIndex = index;
      }
      alpha = Math.max(best, alpha);
      
      if (beta <= alpha)
        break;
    }

    return [best, bestIndex];
  } else {
    let best = MAX;
    let bestIndex = 0;

    for (let i = 0; i < values.length; i++) {
      const [val, index] = alphaBetaAlgorithm({
        depth: depth + 1,
        nodeIndex: nodeIndex * 2 + i,
        maximizingPlayer: true,
        values,
        alpha,
        beta,
      });
      if (val < best) {
        best = val;
        bestIndex = index;
      }
      beta = Math.min(best, beta);
      
      if (beta <= alpha)
        break;
    }

    return [best, bestIndex];
  }
}
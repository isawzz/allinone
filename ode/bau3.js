
async function lacunaSelectPointNeu(p, l) {
  //let [fen, players, pl] = [T.fen, T.players, T.players[getUname()]]
  let id = p.id;
  lookupAddIfToList(B, ['selectedPoints'], id); //console.log(B.selectedPoints.length)
  assertion(B.selectedPoints.length >= 1, "WTF");
  if (B.selectedPoints.length == 1) {
    let eps = [];
    //console.log('possiblePairs', B.possiblePairs);
    for (const line of B.possiblePairs) {
      let p1 = line.p1;
      let p2 = line.p2;
      if (p1.id != id && p2.id != id) continue;
      if (p1.id == id) addIf(eps, p2.id); else addIf(eps, p1.id);

    }
    let unselect = B.endPoints.filter(x => !eps.includes(x));
    unselect.map(x => { let d = mBy(id); mClassRemove(div, 'pulseFastInfinite'); d.onclick = null; });
    B.endPoints = eps; //console.log('endPoints remaining', B.endPoints);
    if (B.endPoints.length < 2) {
      B.selectedPoints.push(B.endPoints[0]);
      await lacunaMoveCompletedME(B.selectedPoints);
    }
  } else {
    assertion(B.selectedPoints.length == 2, "WTF2!!!!!!!!!!!!!");
    await lacunaMoveCompletedME(B.selectedPoints);
  }
}



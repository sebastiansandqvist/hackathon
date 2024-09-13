// each easy side quest is worth 1 point
// each hard / bigboy side quest is worth 2 points
// each hint used costs 1/3 of a point

// export function countCompletedSideQuests(standing: Pick<Standing, 'hacking' | 'logic' | 'algorithms'>) {
//   const { hacking, logic, algorithms } = standing;
//   return (
//     (hacking.easy ?? 0) + // write to the public messages displayed on the homepage -- clientside prompt() asks for a password. the password will be hard-coded in the clientside source, so anyone with devtools can find it.
//     (hacking.hard ?? 0) * 2 - // what if we put a capture-the-flag value in a specific endpoint's ratelimiter error message?
//     hacking.hintsUsed / 3 +
//     (logic.easy ?? 0) +
//     (logic.hard ?? 0) * 2 -
//     logic.hintsUsed / 3 +
//     (algorithms.easy ?? 0) +
//     (algorithms.hard ?? 0) * 2 +
//     (algorithms.bigboy ?? 0) * 2 -
//     algorithms.hintsUsed / 3
//   );
// }


// Selection Pressure
//   Energy Budget Rules (costs)
//     1. Moving costs energy (2 per step)
//     2. Attacking costs energy
//     3. Reproducting costs energy (20 per child)
//   Earning Energy
//     1. Staying still gains energy (1 per step)
//     2. Eating things gains energy (100 per bite)

const energyBudget = {
    costs: {
        move: 1,
        attack: 10,
        reproduce: 20
    },
    earnings: {
        stay: 1,
        eat: 10
    }
}
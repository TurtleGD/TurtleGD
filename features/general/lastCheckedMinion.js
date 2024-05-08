import settings from '../../settings';
import { getArea, getTime } from '../../utils/functions';
import { pogData } from '../../utils/pogData';

// Returns true if first 3 items of arrays match
function compareFirstThree(arr1, arr2) {
    return arr1.slice(0, 3).every((value, index) => value == arr2[index]);
}

let lastMinionInteract = [];
let inIsland = false;

register('worldLoad', () => {
    setTimeout(() => inIsland = getArea() == 'Your Island', 500);
})

// Gets the position of the last entity you right click on
register('packetSent', (packet) => {
    if (packet.class.getSimpleName().toString() == 'C02PacketUseEntity') {
        const entity = new Entity(packet.func_149564_a(World.getWorld()))
        lastMinionInteract.length = 0
        lastMinionInteract.push(entity.getX(), entity.getY(), entity.getZ())
    }
})

register('step', () => {
    if (Player?.getContainer()?.getName()?.includes('Minion') && settings.lastCheckedMinion) {
        // If minion location is new add it
        if (!pogData.minionData.some(loc => compareFirstThree(loc, [lastMinionInteract[0], lastMinionInteract[1], lastMinionInteract[2]]))) pogData.minionData.push([lastMinionInteract[0], lastMinionInteract[1], lastMinionInteract[2], new Date().getTime()]);

        // Update timestamp
        pogData.minionData.forEach(minion => {
            if (minion[0] == lastMinionInteract[0] && minion[1] == lastMinionInteract[1] && minion[2] == lastMinionInteract[2]) minion[3] = new Date().getTime();
        })

        pogData.save();
    }
})

register('renderWorld', () => {
    if (inIsland && settings.lastCheckedMinion) {
        pogData.minionData.forEach(minion => {
            Tessellator.drawString(`Last checked: ${getTime(Math.floor((new Date().getTime() - minion[3]) / 1000))} ago`, minion[0], minion[1] + 2, minion[2], Renderer.WHITE, true, 0.025, false)
        })
    }
})
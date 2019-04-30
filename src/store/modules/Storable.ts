import Vue from 'vue';
import Vuex from 'vuex';
import { StoredObjectMethods } from "@/models/StoredObject"

Vue.use(Vuex);
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'
const store = new Vuex.Store({})

class Entity {
    constructor() {
        this.id = this.getRandomId();
    }
    id: string;
    createdAt = new Date();
    private getMS() {
        return new Date().getTime().toString();
    }
    private getRandomId() {
        // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
        // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
        for (let i = 0, len = chars.length; i < len; i++) {
            switch (chars[i]) {
                case "x":
                    chars[i] = Math.floor(Math.random() * 16).toString(16);
                    break;
                case "y":
                    chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                    break;
            }
        }
        return chars.join("");
    }

}
export class Player extends Entity {
    name: string = "test";
    rank = 1;
    star: boolean = false
    comment: string = "";
    constructor(init?: Partial<Player>) {
        super();
        if (init)
            Object.assign(this, init);
    }
    getRank() {
        return this.rank + (this.star ? 99 : 0);
    }
}
enum TEAM {
    A, B, WATCHING
}

import { StageRoot, Rule } from "@/store/modules/Constant"

export class Game extends Entity {
    teamA: Player[] = [];
    teamB: Player[] = [];
    winning: TEAM = TEAM.A;
    stage!: StageRoot;
    rule!: Rule;
    constructor(init: Partial<Game>) {
        super();
        Object.assign(this, init);
    }
}

import { WeaponRoot } from "@/store/modules/Constant"

export class History extends Entity {
    team!: TEAM;
    winning!: TEAM;
    stage!: StageRoot;
    rule!: Rule;
    player!: Player;
    weapon?: WeaponRoot;
    constructor() {
        super();
    }
}
export class StoredObject {
    players: Player[] = [];
    selectedPlayers: Player[] = [];
    games: Game[] = [];
    histories: History[] = [];
    constructor() { }
}
@Module({ dynamic: true, store: store, name: "Storable", namespaced: true })
export default class Storable extends VuexModule implements StoredObjectMethods {
    STORED_OBJECT_KEY: string = "STORED_OBJECT_KEY_MYDATA";
    StoredObject: StoredObject = new StoredObject();
    get KEY() {
        // console.log(this.StoredObject);
        // return this.StoredObject.toString();
        return this.StoredObject.players.toString() + this.StoredObject.selectedPlayers.toString() + this.StoredObject.games.toString() + this.StoredObject.histories.toString();
        // return this.StoredObject.getKeys();
    }
    @Mutation
    SET_VALUE(StoredObject: StoredObject) {
        this.StoredObject = StoredObject;
    }
    @Mutation
    SET_PLAYERS_SELECTED(players: Player[]) {
        this.StoredObject.selectedPlayers = players;
    }

    @Action({ rawError: true })
    updatePlayer(update: Player) {
        var index = this.StoredObject.players.findIndex(e => {
            return e.id == update.id;
        })
        this.StoredObject.players.splice(index, 1, update);
        this.save();
    }

    @Action
    save() {
        console.log("start save.");
        var storedObject = JSON.stringify(this.StoredObject);
        localStorage.setItem(this.STORED_OBJECT_KEY, storedObject);
    }
    @Action
    load() {
        console.log("start load.");
        let storedObject = localStorage.getItem(this.STORED_OBJECT_KEY);
        var so: StoredObject = new StoredObject();
        if (storedObject != null) {
            so = JSON.parse(storedObject) as StoredObject;
        }
        this.SET_VALUE(so);
    }
    @Action
    addPlayer(player: Player) {
        this.StoredObject.players.push(player);
    }
    @Action
    removePlayer(player: Player) {
        this.StoredObject.players = this.StoredObject.players.filter(e => {
            return e.id != player.id;
        })
        this.StoredObject.selectedPlayers = this.StoredObject.selectedPlayers.filter(e => {
            return e.id != player.id;
        })
    }
}

export const StorableModule = getModule(Storable);
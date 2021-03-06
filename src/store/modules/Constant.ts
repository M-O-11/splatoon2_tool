import Vue from 'vue';
import Axios from 'axios';
import { StoredObjectMethods } from "@/models/StoredObject"
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators'

import store from "@/store/index"

export class StoredConstantObject {
    timestamp: number = 0;
    ruleRoots: RuleRoot[] = [];
    weaponRoots: WeaponRoot[] = [];
    stageRoots: StageRoot[] = [];
    rules: Rule[] = [];
    constructor() { }
}
export class StoredObject {
    constant: StoredConstantObject = new StoredConstantObject();
    selected: StoredConstantObject = new StoredConstantObject();
}

@Module({ dynamic: true, store: store, name: "Constant", namespaced: true })
export default class Constant extends VuexModule implements StoredObjectMethods {
    STORED_OBJECT_KEY = "STORED_OBJECT_KEY_CONSTANT";
    storedObject: StoredObject = new StoredObject();
    get KEY() {
        return this.storedObject.selected.ruleRoots.toString() +
            this.storedObject.selected.rules.toString() +
            this.storedObject.selected.weaponRoots.toString() +
            this.storedObject.selected.stageRoots.toString();
    }
    @Mutation
    SET_STORED(value: StoredObject) {
        this.storedObject = value;
    }
    @Mutation
    SET_STORED_SELECTED(value: StoredConstantObject) {
        this.storedObject.selected = value;
    }
    @Mutation
    SET_CONSTANT_WEAPON_SELECTED(weapons: WeaponRoot[]) {
        this.storedObject.selected.weaponRoots = weapons;
    }
    @Mutation
    SET_CONSTANT_STAGE_SELECTED(stages: StageRoot[]) {
        this.storedObject.selected.stageRoots = stages;
    }
    @Mutation
    SET_RULE_SELECTED(rules: Rule[]) {
        this.storedObject.selected.rules = rules;
    }
    // @Mutation
    // SET_CONSTANT_RULE_SELECTED(rules: RuleRoot[]) {
    //     this.storedConstantObjectSelected.ruleRoots = rules;
    // }

    @Action
    async fetchRules() {
        let url = "https://stat.ink/api/v2/rule";
        let result = await Axios.get(url);
        this.storedObject.constant.ruleRoots = [];
        if (result.status = 200) {
            this.storedObject.constant.ruleRoots = result.data as RuleRoot[];
            let privateRules = this.storedObject.constant.ruleRoots.find(e => {
                return e.key == "private";
            }) || new RuleRoot();
            this.storedObject.constant.rules = privateRules.rules;
            this.storedObject.selected.rules = privateRules.rules;
        }
    }
    @Action
    async fetchWeapons() {
        let url = "https://stat.ink/api/v2/weapon";
        let result = await Axios.get(url);
        this.storedObject.constant.weaponRoots = [];
        if (result.status = 200) {
            this.storedObject.constant.weaponRoots = result.data as WeaponRoot[];
            this.storedObject.selected.weaponRoots = result.data as WeaponRoot[];
        }
    }
    get weaponsOfKinds() {
        const group = this.storedObject.constant.weaponRoots.reduce((result: AggregateKinds[], current) => {
            const element = result.find((p) => p.type.key === current.type.key);
            if (element) {
                element.count++;
            } else {
                let ag = new AggregateKinds()
                ag.type = current.type;

                ag.count++;
                result.push(ag);
            }
            return result;
        }, []);
        group.forEach(element => {
            console.log(element.type.category.key, element.count);
        });
        return group;
    }
    @Action
    async fetchStages() {
        let url = "https://stat.ink/api/v2/stage";
        let result = await Axios.get(url);
        this.storedObject.constant.stageRoots = [];
        if (result.status = 200) {
            this.storedObject.constant.stageRoots = result.data as StageRoot[];
            this.storedObject.selected.stageRoots = result.data as StageRoot[];
        }
    }

    @Action
    refresh() {
        this.delete();
        this.load();
    }
    @Action
    delete() {
        localStorage.removeItem(this.STORED_OBJECT_KEY);
    }

    @Action
    async load() {
        console.log("start load.");
        let storedObject = localStorage.getItem(this.STORED_OBJECT_KEY);
        const loading = async () => {
            console.log("new.");
            await this.fetchRules();
            await this.fetchWeapons();
            await this.fetchStages();
            this.storedObject.constant.timestamp = new Date().getTime();
        }
        if (storedObject != null) {
            console.log("already.");
            this.SET_STORED(JSON.parse(storedObject) as StoredObject)
            if (this.storedObject.constant.timestamp > new Date().getTime() + 1000 * 60 * 60 * 24) {
                await loading();
            }
        } else {
            await loading();
        }
        console.log("rules", this.storedObject.constant.ruleRoots);
        console.log("weapons", this.storedObject.constant.weaponRoots);

        this.storedObject.constant.weaponRoots = this.storedObject.constant.weaponRoots.filter(e => {
            return e.reskin_of == null;
        })

        this.storedObject.constant.weaponRoots = this.storedObject.constant.weaponRoots.filter(e => {
            return !e.key.includes("scope");
        })
        this.storedObject.constant.stageRoots = this.storedObject.constant.stageRoots.filter(e => {
            return !e.key.includes("mystery");
        })
        console.log("remove duplicate weapons", this.storedObject.constant.weaponRoots);
        console.log("stages", this.storedObject.constant.stageRoots);
        this.save();

    }
    @Action
    async save() {
        console.log("start save.");
        var storedObject = JSON.stringify(this.storedObject);
        localStorage.setItem(this.STORED_OBJECT_KEY, storedObject);
    }

    get weapons() {
        return this.storedObject.constant.weaponRoots;
    }
    get stages() {
        return this.storedObject.constant.stageRoots;
    }
    get rules() {
        return this.storedObject.constant.rules;
    }
}

export class AggregateKinds {
    type: Type = new Type();
    count: number = 0;
}

export const ConstantModule = getModule(Constant);

export class Name {
    de_DE: string = "";
    en_GB: string = "";
    en_US: string = "";
    es_ES: string = "";
    es_MX: string = "";
    fr_CA: string = "";
    fr_FR: string = "";
    it_IT: string = "";
    ja_JP: string = "";
    nl_NL: string = "";
    ru_RU: string = "";
}

export class Rule {
    key: string = "";
    name: Name = new Name();
}

export class RuleRoot {
    key: string = "";
    name: Name = new Name();
    rules: Rule[] = [];
}

export class Category {
    key: string = "";
    name: Name = new Name();
}

export class Type {
    key: string = "";
    name: Name = new Name();
    category: Category = new Category();
}

export class Sub {
    key: string = "";
    name: Name = new Name();
}

export class Special {
    key: string = "";
    name: Name = new Name();
}

export class WeaponRoot {
    key: string = "";
    splatnet?: number;
    type: Type = new Type();
    name: Name = new Name();
    sub: Sub = new Sub();
    special: Special = new Special();
    reskin_of?: string;
    main_ref?: string;
}

export interface ShortName {
    de_DE: string;
    en_GB: string;
    en_US: string;
    es_ES: string;
    es_MX: string;
    fr_CA: string;
    fr_FR: string;
    it_IT: string;
    ja_JP: string;
    nl_NL: string;
    ru_RU: string;
}

export interface ReleaseAt {
    time: number;
    iso8601: Date;
}

export class StageRoot {
    key: string = "";
    splatnet!: number;
    name: Name = new Name();
    short_name!: ShortName;
    area?: number;
    release_at!: ReleaseAt;
}

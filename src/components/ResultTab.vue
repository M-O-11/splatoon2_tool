<template>
  <div>
    <v-toolbar flat color="white">
      <!-- <v-btn color="success" @click="create()">新しいゲーム</v-btn>
      <v-btn color="success" @click="assignAll()">ｽﾍﾞﾃﾗﾝﾀﾞﾑ</v-btn>
      <v-btn color="success" @click="assignRandomWeapons()">ﾗﾝﾀﾞﾑﾌﾞｷ</v-btn>
      <v-btn color="success" @click="assignRandomStage()">ﾗﾝﾗﾑｽﾃｰｼﾞ</v-btn>
      <v-btn color="success" @click="assignRandomRule()">ﾗﾝﾀﾞﾑﾙｰﾙ</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="record('A')">A勝利</v-btn>
      <v-btn color="info" @click="record('B')">B勝利</v-btn>-->
    </v-toolbar>
    <!-- <div>
      <div>
        GAMEID:{{newGame.getShortId()}} |
        DATE:{{newGame.getFormattedCreatedAt()}}
      </div>
      <div>
        STAGE:{{newGame.stage.name.ja_JP}} |
        RULE:{{newGame.rule.name.ja_JP}}
      </div>
    </div>-->
    <v-data-table
      :headers="headers"
      :items="newGame.results"
      class="elevation-1"
      item-key="id"
      hide-headers
      hide-actions
    >
      <template v-slot:items="props">
        <tr>
          <td class="team">{{ props.item.getTeamName()}}</td>
          <td class="name">{{ props.item.player.name }}</td>
          <td class="weaponName">{{ props.item.weapon!=null?props.item.weapon.name.ja_JP:""}}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { DataTableHeader } from "@/models/Defs";
import { ConstantModule } from "@/store/modules/Constant";
import {
  StorableModule,
  Player,
  Game,
  History
} from "@/store/modules/Storable";
export default Vue.extend({
  data() {
    return {
      pagination: {
        rowsPerPage: 15
      },
      rowsPerPageItems: [
        5,
        10,
        15,
        25,
        { text: "$vuetify.dataIterator.rowsPerPageAll", value: -1 }
      ],
      newPlayerDialog: false,
      headers: [
        new DataTableHeader({
          text: "チーム",
          align: "left"
        }),
        new DataTableHeader({
          text: "名前",
          align: "left",
          value: "name"
        }),
        new DataTableHeader({
          text: "ブキ",
          value: "weapon",
          align: "left"
        })
      ]
    };
  },
  methods: {
    create() {
      this.gameManager.initGame();
      this.newGame.assignPlayers();
    },
    assignRandomWeapons() {
      this.newGame.assignRandomWeapons();
    },
    assignRandomStage() {
      this.newGame.assignRandomStage();
    },
    assignRandomRule() {
      this.newGame.assignRandomRule();
    },
    assignAll() {
      this.create();
      this.assignRandomWeapons();
      this.assignRandomStage();
      this.assignRandomRule();
    },
    record(team) {
      if (team == "A") {
        console.log("win A");
      } else {
        console.log("win B");
      }
      gameManager;
    },
    registering() {
      this.gameManager.registering();
    }
  },
  watch: {
    watchedStore(newValue, oldValue) {
      StorableModule.save();
    },
    deep: true
  },
  computed: {
    watchedStore() {
      return StorableModule.KEY;
    },
    selectedPlayers: {
      set: function(newValue) {
        StorableModule.SET_PLAYERS_SELECTED(newValue);
      },
      get: function() {
        return StorableModule.StoredObject.selectedPlayers;
      }
    },
    newGame() {
      return StorableModule.StoredObject.gameManager.newGame;
    },
    gameManager() {
      return StorableModule.StoredObject.gameManager;
    }
  },
  created() {},
  destroyed() {
    StorableModule.save();
  },
  components: {}
});
</script>

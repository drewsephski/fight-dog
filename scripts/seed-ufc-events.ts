#!/usr/bin/env bun

/**
 * UFC Events Data Seeding Script
 * 
 * This script seeds the database with the next 6 upcoming UFC events
 * with proper fight card ordering (main event, co-main, prelims)
 * 
 * Events included:
 * 1. UFC Fight Night: Della Maddalena vs Prates (May 2, 2026)
 * 2. UFC 328: Chimaev vs Strickland (May 9, 2026)
 * 3. UFC Fight Night: Allen vs Costa (May 16, 2026)
 * 4. UFC Fight Night: Song vs Figueiredo (May 30, 2026)
 * 5. UFC Fight Night: Muhammad vs Bonfim (June 6, 2026)
 * 6. UFC Freedom 250: Topuria vs Gaethje (June 14, 2026)
 */

import { prisma } from '../lib/db/prisma'

interface FighterData {
  name: string
  nickname?: string
  record?: string
  division?: string
  stance?: string
  reach?: string
  height?: string
  weight?: string
  age?: number
  nationality?: string
  imageUrl?: string
  wins?: number
  losses?: number
  draws?: number
  noContests?: number
}

interface FightData {
  fighter1: string
  fighter2: string
  weightClass: string
  isMainEvent: boolean
  isTitleFight: boolean
  rounds: number
  position: number // 1 = main event, 2 = co-main, etc.
}

interface EventData {
  name: string
  date: Date
  location: string
  venue: string
  isPpv: boolean
  fights: FightData[]
}

// Fighter database with comprehensive profiles
const fighterDatabase: Record<string, FighterData> = {
  // UFC Fight Night: Della Maddalena vs Prates
  "Jack Della Maddalena": {
    name: "Jack Della Maddalena",
    nickname: "The Nightmare",
    record: "18-3-0",
    division: "Welterweight",
    stance: "Orthodox",
    reach: "72\"",
    height: "5' 11\"",
    weight: "170 lbs",
    age: 29,
    nationality: "Australia",
    wins: 18,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Carlos Prates": {
    name: "Carlos Prates",
    record: "23-7-0",
    division: "Welterweight",
    stance: "Southpaw",
    reach: "71\"",
    height: "6' 1\"",
    weight: "170 lbs",
    age: 32,
    nationality: "Brazil",
    wins: 23,
    losses: 7,
    draws: 0,
    noContests: 0
  },
  "Beneil Dariush": {
    name: "Beneil Dariush",
    record: "23-7-1",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "72\"",
    height: "5' 10\"",
    weight: "155 lbs",
    age: 35,
    nationality: "USA",
    wins: 23,
    losses: 7,
    draws: 1,
    noContests: 0
  },
  "Quillan Salkilld": {
    name: "Quillan Salkilld",
    record: "11-1-0",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "70\"",
    height: "5' 10\"",
    weight: "155 lbs",
    age: 25,
    nationality: "Australia",
    wins: 11,
    losses: 1,
    draws: 0,
    noContests: 0
  },
  "Tim Elliott": {
    name: "Tim Elliott",
    record: "22-13-1",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "69\"",
    height: "5' 7\"",
    weight: "125 lbs",
    age: 37,
    nationality: "USA",
    wins: 22,
    losses: 13,
    draws: 1,
    noContests: 0
  },
  "Steve Erceg": {
    name: "Steve Erceg",
    record: "13-4-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 5\"",
    weight: "125 lbs",
    age: 29,
    nationality: "USA",
    wins: 13,
    losses: 4,
    draws: 0,
    noContests: 0
  },
  "Tai Tuivasa": {
    name: "Tai Tuivasa",
    record: "15-9-0",
    division: "Heavyweight",
    stance: "Orthodox",
    reach: "75\"",
    height: "6' 2\"",
    weight: "265 lbs",
    age: 32,
    nationality: "Australia",
    wins: 15,
    losses: 9,
    draws: 0,
    noContests: 0
  },
  "Sean Sharaf": {
    name: "Sean Sharaf",
    record: "4-2-0",
    division: "Heavyweight",
    stance: "Orthodox",
    reach: "76\"",
    height: "6' 4\"",
    weight: "251 lbs",
    age: 30,
    nationality: "Australia",
    wins: 4,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Jacob Malkoun": {
    name: "Jacob Malkoun",
    record: "9-3-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "73\"",
    height: "5' 11\"",
    weight: "185 lbs",
    age: 29,
    nationality: "Australia",
    wins: 9,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Gerald Meerschaert": {
    name: "Gerald Meerschaert",
    record: "37-21-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "76\"",
    height: "6' 1\"",
    weight: "185 lbs",
    age: 37,
    nationality: "USA",
    wins: 37,
    losses: 21,
    draws: 0,
    noContests: 0
  },
  "Junior Tafa": {
    name: "Junior Tafa",
    record: "6-5-0",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "74\"",
    height: "6' 0\"",
    weight: "205 lbs",
    age: 28,
    nationality: "Australia",
    wins: 6,
    losses: 5,
    draws: 0,
    noContests: 0
  },
  "Kevin Christian": {
    name: "Kevin Christian",
    record: "9-3-0",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "75\"",
    height: "6' 1\"",
    weight: "205 lbs",
    age: 25,
    nationality: "Brazil",
    wins: 9,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Kody Steele": {
    name: "Kody Steele",
    record: "7-1-0",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "71\"",
    height: "5' 9\"",
    weight: "155 lbs",
    age: 25,
    nationality: "USA",
    wins: 7,
    losses: 1,
    draws: 0,
    noContests: 0
  },
  "Dom Mar Fan": {
    name: "Dom Mar Fan",
    record: "9-2-0",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "70\"",
    height: "5' 8\"",
    weight: "155 lbs",
    age: 28,
    nationality: "Australia",
    wins: 9,
    losses: 2,
    draws: 0,
    noContests: 0
  },

  // UFC 328: Chimaev vs Strickland
  "Khamzat Chimaev": {
    name: "Khamzat Chimaev",
    nickname: "Borz",
    record: "15-0-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "75\"",
    height: "6' 2\"",
    weight: "185 lbs",
    age: 30,
    nationality: "United Arab Emirates",
    wins: 15,
    losses: 0,
    draws: 0,
    noContests: 0
  },
  "Sean Strickland": {
    name: "Sean Strickland",
    nickname: "Tarzan",
    record: "30-7-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "76\"",
    height: "6' 1\"",
    weight: "185 lbs",
    age: 33,
    nationality: "USA",
    wins: 30,
    losses: 7,
    draws: 0,
    noContests: 0
  },
  "Joshua Van": {
    name: "Joshua Van",
    record: "16-2-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "67\"",
    height: "5' 5\"",
    weight: "125 lbs",
    age: 24,
    nationality: "USA",
    wins: 16,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Tatsuro Taira": {
    name: "Tatsuro Taira",
    record: "18-1-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 7\"",
    weight: "125 lbs",
    age: 26,
    nationality: "Japan",
    wins: 18,
    losses: 1,
    draws: 0,
    noContests: 0
  },
  "Alexander Volkov": {
    name: "Alexander Volkov",
    nickname: "Drago",
    record: "39-11-0",
    division: "Heavyweight",
    stance: "Orthodox",
    reach: "80\"",
    height: "6' 7\"",
    weight: "240 lbs",
    age: 36,
    nationality: "Russia",
    wins: 39,
    losses: 11,
    draws: 0,
    noContests: 0
  },
  "Waldo Cortes-Acosta": {
    name: "Waldo Cortes-Acosta",
    record: "17-2-0",
    division: "Heavyweight",
    stance: "Orthodox",
    reach: "78\"",
    height: "6' 4\"",
    weight: "263 lbs",
    age: 34,
    nationality: "Dominican Republic",
    wins: 17,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Sean Brady": {
    name: "Sean Brady",
    record: "18-2-0",
    division: "Welterweight",
    stance: "Orthodox",
    reach: "70\"",
    height: "5' 9\"",
    weight: "170 lbs",
    age: 31,
    nationality: "USA",
    wins: 18,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Joaquin Buckley": {
    name: "Joaquin Buckley",
    nickname: "New Mansa",
    record: "21-7-0",
    division: "Welterweight",
    stance: "Southpaw",
    reach: "74\"",
    height: "5' 10\"",
    weight: "170 lbs",
    age: 31,
    nationality: "USA",
    wins: 21,
    losses: 7,
    draws: 0,
    noContests: 0
  },
  "King Green": {
    name: "Bobby Green",
    nickname: "King",
    record: "34-17-1",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "71\"",
    height: "5' 10\"",
    weight: "155 lbs",
    age: 37,
    nationality: "USA",
    wins: 34,
    losses: 17,
    draws: 1,
    noContests: 0
  },
  "Jeremy Stephens": {
    name: "Jeremy Stephens",
    nickname: "Lil' Heathen",
    record: "29-22-0",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "71\"",
    height: "5' 9\"",
    weight: "155 lbs",
    age: 38,
    nationality: "USA",
    wins: 29,
    losses: 22,
    draws: 0,
    noContests: 0
  },
  "Jan Blachowicz": {
    name: "Jan Blachowicz",
    record: "29-11-2",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "78\"",
    height: "6' 2\"",
    weight: "205 lbs",
    age: 41,
    nationality: "Poland",
    wins: 29,
    losses: 11,
    draws: 2,
    noContests: 0
  },
  "Bogdan Guskov": {
    name: "Bogdan Guskov",
    record: "18-3-1",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "76\"",
    height: "6' 2\"",
    weight: "205 lbs",
    age: 31,
    nationality: "Uzbekistan",
    wins: 18,
    losses: 3,
    draws: 1,
    noContests: 0
  },
  "Ateba Gautier": {
    name: "Ateba Gautier",
    record: "10-1-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "75\"",
    height: "6' 0\"",
    weight: "185 lbs",
    age: 28,
    nationality: "Cameroon",
    wins: 10,
    losses: 1,
    draws: 0,
    noContests: 0
  },
  "Ozzy Diaz": {
    name: "Osman Diaz",
    record: "10-3-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "73\"",
    height: "5' 11\"",
    weight: "185 lbs",
    age: 30,
    nationality: "USA",
    wins: 10,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Roman Kopylov": {
    name: "Roman Kopylov",
    record: "14-5-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "74\"",
    height: "6' 0\"",
    weight: "185 lbs",
    age: 32,
    nationality: "Russia",
    wins: 14,
    losses: 5,
    draws: 0,
    noContests: 0
  },
  "Marco Tulio": {
    name: "Marco Tulio",
    record: "14-2-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "73\"",
    height: "6' 0\"",
    weight: "185 lbs",
    age: 31,
    nationality: "Brazil",
    wins: 14,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Clayton Carpenter": {
    name: "Clayton Carpenter",
    record: "8-2-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 5\"",
    weight: "125 lbs",
    age: 27,
    nationality: "USA",
    wins: 8,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Jose Ochoa": {
    name: "Jose Ochoa",
    record: "8-2-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "67\"",
    height: "5' 7\"",
    weight: "125 lbs",
    age: 25,
    nationality: "USA",
    wins: 8,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Baisangur Susurkaev": {
    name: "Baisangur Susurkaev",
    record: "11-0-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "74\"",
    height: "6' 0\"",
    weight: "185 lbs",
    age: 28,
    nationality: "Russia",
    wins: 11,
    losses: 0,
    draws: 0,
    noContests: 0
  },
  "Djorden Santos": {
    name: "Djorden Santos",
    record: "11-2-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "73\"",
    height: "5' 11\"",
    weight: "185 lbs",
    age: 30,
    nationality: "Brazil",
    wins: 11,
    losses: 2,
    draws: 0,
    noContests: 0
  },

  // UFC Fight Night: Allen vs Costa
  "Arnold Allen": {
    name: "Arnold Allen",
    nickname: "Almighty",
    record: "20-4-0",
    division: "Featherweight",
    stance: "Southpaw",
    reach: "70\"",
    height: "5' 8\"",
    weight: "145 lbs",
    age: 30,
    nationality: "England",
    wins: 20,
    losses: 4,
    draws: 0,
    noContests: 0
  },
  "Melquizael Costa": {
    name: "Melquizael Costa",
    nickname: "The Dalmatian",
    record: "26-7-0",
    division: "Featherweight",
    stance: "Southpaw",
    reach: "71\"",
    height: "5' 10\"",
    weight: "145 lbs",
    age: 27,
    nationality: "Brazil",
    wins: 26,
    losses: 7,
    draws: 0,
    noContests: 0
  },
  "Ketlen Vieira": {
    name: "Ketlen Vieira",
    record: "15-5-0",
    division: "Women's Bantamweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 7\"",
    weight: "135 lbs",
    age: 32,
    nationality: "Brazil",
    wins: 15,
    losses: 5,
    draws: 0,
    noContests: 0
  },
  "Jacqueline Cavalcanti": {
    name: "Jacqueline Cavalcanti",
    record: "10-1-0",
    division: "Women's Bantamweight",
    stance: "Orthodox",
    reach: "67\"",
    height: "5' 6\"",
    weight: "135 lbs",
    age: 29,
    nationality: "Portugal",
    wins: 10,
    losses: 1,
    draws: 0,
    noContests: 0
  },
  "Modestas Bukauskas": {
    name: "Modestas Bukauskas",
    record: "19-7-0",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "76\"",
    height: "6' 3\"",
    weight: "205 lbs",
    age: 31,
    nationality: "Lithuania",
    wins: 19,
    losses: 7,
    draws: 0,
    noContests: 0
  },
  "Rodolfo Bellato": {
    name: "Rodolfo Bellato",
    record: "13-3-1",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "75\"",
    height: "6' 1\"",
    weight: "205 lbs",
    age: 28,
    nationality: "Brazil",
    wins: 13,
    losses: 3,
    draws: 1,
    noContests: 0
  },
  "Alice Ardelean": {
    name: "Alice Ardelean",
    record: "11-7-0",
    division: "Women's Strawweight",
    stance: "Orthodox",
    reach: "65\"",
    height: "5' 4\"",
    weight: "115 lbs",
    age: 30,
    nationality: "Romania",
    wins: 11,
    losses: 7,
    draws: 0,
    noContests: 0
  },
  "Polyana Viana": {
    name: "Polyana Viana",
    record: "13-8-0",
    division: "Women's Strawweight",
    stance: "Orthodox",
    reach: "64\"",
    height: "5' 4\"",
    weight: "115 lbs",
    age: 31,
    nationality: "Brazil",
    wins: 13,
    losses: 8,
    draws: 0,
    noContests: 0
  },
  "Daniel Barez": {
    name: "Daniel Barez",
    record: "17-7-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 7\"",
    weight: "125 lbs",
    age: 31,
    nationality: "Spain",
    wins: 17,
    losses: 7,
    draws: 0,
    noContests: 0
  },
  "Luis Gurule": {
    name: "Luis Gurule",
    record: "10-3-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "67\"",
    height: "5' 6\"",
    weight: "125 lbs",
    age: 28,
    nationality: "USA",
    wins: 10,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Timmy Cuamba": {
    name: "Timmy Cuamba",
    record: "10-3-0",
    division: "Bantamweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 7\"",
    weight: "135 lbs",
    age: 26,
    nationality: "USA",
    wins: 10,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Benardo Sopaj": {
    name: "Benardo Sopaj",
    record: "12-3-0",
    division: "Bantamweight",
    stance: "Orthodox",
    reach: "69\"",
    height: "5' 8\"",
    weight: "135 lbs",
    age: 27,
    nationality: "Albania",
    wins: 12,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Tuco Tokkos": {
    name: "Tuco Tokkos",
    record: "11-5-0",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "75\"",
    height: "6' 1\"",
    weight: "205 lbs",
    age: 29,
    nationality: "England",
    wins: 11,
    losses: 5,
    draws: 0,
    noContests: 0
  },
  "Ivan Erslan": {
    name: "Ivan Erslan",
    record: "14-6-0",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "76\"",
    height: "6' 2\"",
    weight: "205 lbs",
    age: 30,
    nationality: "Croatia",
    wins: 14,
    losses: 6,
    draws: 0,
    noContests: 0
  },

  // UFC Fight Night: Song vs Figueiredo
  "Song Yadong": {
    name: "Song Yadong",
    record: "22-9-1",
    division: "Bantamweight",
    stance: "Orthodox",
    reach: "67\"",
    height: "5' 6\"",
    weight: "135 lbs",
    age: 27,
    nationality: "China",
    wins: 22,
    losses: 9,
    draws: 1,
    noContests: 0
  },
  "Deiveson Figueiredo": {
    name: "Deiveson Figueiredo",
    nickname: "Deus Da Guerra",
    record: "25-6-1",
    division: "Bantamweight",
    stance: "Orthodox",
    reach: "67\"",
    height: "5' 5\"",
    weight: "135 lbs",
    age: 36,
    nationality: "Brazil",
    wins: 25,
    losses: 6,
    draws: 1,
    noContests: 0
  },
  "Zhang Mingyang": {
    name: "Zhang Mingyang",
    record: "19-7-0",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "75\"",
    height: "6' 2\"",
    weight: "205 lbs",
    age: 26,
    nationality: "China",
    wins: 19,
    losses: 7,
    draws: 0,
    noContests: 0
  },
  "Alonzo Menifield": {
    name: "Alonzo Menifield",
    record: "17-6-1",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "74\"",
    height: "6' 0\"",
    weight: "205 lbs",
    age: 35,
    nationality: "USA",
    wins: 17,
    losses: 6,
    draws: 1,
    noContests: 0
  },
  "Sergei Pavlovich": {
    name: "Sergei Pavlovich",
    record: "20-3-0",
    division: "Heavyweight",
    stance: "Orthodox",
    reach: "80\"",
    height: "6' 3\"",
    weight: "265 lbs",
    age: 32,
    nationality: "Russia",
    wins: 20,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Tallison Teixeira": {
    name: "Tallison Teixeira",
    record: "3-0-0",
    division: "Heavyweight",
    stance: "Orthodox",
    reach: "78\"",
    height: "6' 1\"",
    weight: "250 lbs",
    age: 28,
    nationality: "Brazil",
    wins: 3,
    losses: 0,
    draws: 0,
    noContests: 0
  },
  "Alex Perez": {
    name: "Alex Perez",
    record: "26-8-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "66\"",
    height: "5' 6\"",
    weight: "125 lbs",
    age: 32,
    nationality: "USA",
    wins: 26,
    losses: 8,
    draws: 0,
    noContests: 0
  },
  "Sumudaerji": {
    name: "Sumudaerji",
    record: "15-6-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "65\"",
    height: "5' 4\"",
    weight: "125 lbs",
    age: 24,
    nationality: "China",
    wins: 15,
    losses: 6,
    draws: 0,
    noContests: 0
  },
  "Kai Asakura": {
    name: "Kai Asakura",
    record: "21-4-0",
    division: "Bantamweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 7\"",
    weight: "135 lbs",
    age: 30,
    nationality: "Japan",
    wins: 21,
    losses: 4,
    draws: 0,
    noContests: 0
  },
  "Cameron Smotherman": {
    name: "Cameron Smotherman",
    record: "16-4-0",
    division: "Bantamweight",
    stance: "Orthodox",
    reach: "69\"",
    height: "5' 8\"",
    weight: "135 lbs",
    age: 29,
    nationality: "USA",
    wins: 16,
    losses: 4,
    draws: 0,
    noContests: 0
  },
  "Muslim Salikhov": {
    name: "Muslim Salikhov",
    record: "20-5-0",
    division: "Welterweight",
    stance: "Southpaw",
    reach: "73\"",
    height: "6' 1\"",
    weight: "170 lbs",
    age: 37,
    nationality: "Russia",
    wins: 20,
    losses: 5,
    draws: 0,
    noContests: 0
  },
  "Jake Matthews": {
    name: "Jake Matthews",
    record: "20-6-0",
    division: "Welterweight",
    stance: "Orthodox",
    reach: "72\"",
    height: "5' 10\"",
    weight: "170 lbs",
    age: 29,
    nationality: "Australia",
    wins: 20,
    losses: 6,
    draws: 0,
    noContests: 0
  },
  "Angela Hill": {
    name: "Angela Hill",
    nickname: "Overkill",
    record: "15-13-0",
    division: "Women's Strawweight",
    stance: "Orthodox",
    reach: "64\"",
    height: "5' 3\"",
    weight: "115 lbs",
    age: 38,
    nationality: "USA",
    wins: 15,
    losses: 13,
    draws: 0,
    noContests: 0
  },
  "Jingnan Xiong": {
    name: "Jingnan Xiong",
    record: "18-3-0",
    division: "Women's Strawweight",
    stance: "Orthodox",
    reach: "63\"",
    height: "5' 2\"",
    weight: "115 lbs",
    age: 29,
    nationality: "China",
    wins: 18,
    losses: 3,
    draws: 0,
    noContests: 0
  },

  // UFC Fight Night: Muhammad vs Bonfim
  "Belal Muhammad": {
    name: "Belal Muhammad",
    nickname: "Remember the Name",
    record: "24-5-0",
    division: "Welterweight",
    stance: "Orthodox",
    reach: "72\"",
    height: "5' 11\"",
    weight: "171 lbs",
    age: 35,
    nationality: "Palestine",
    wins: 24,
    losses: 5,
    draws: 0,
    noContests: 0
  },
  "Gabriel Bonfim": {
    name: "Gabriel Bonfim",
    record: "19-1-0",
    division: "Welterweight",
    stance: "Orthodox",
    reach: "72.5",
    height: "6' 1\"",
    weight: "170 lbs",
    age: 27,
    nationality: "Brazil",
    wins: 19,
    losses: 1,
    draws: 0,
    noContests: 0
  },
  "Iwo Baraniewski": {
    name: "Iwo Baraniewski",
    record: "8-0-0",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "76\"",
    height: "6' 3\"",
    weight: "205 lbs",
    age: 26,
    nationality: "Poland",
    wins: 8,
    losses: 0,
    draws: 0,
    noContests: 0
  },
  "Billy Elekana": {
    name: "Billy Elekana",
    record: "10-2-0",
    division: "Light Heavyweight",
    stance: "Orthodox",
    reach: "75\"",
    height: "6' 1\"",
    weight: "205 lbs",
    age: 28,
    nationality: "USA",
    wins: 10,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Imanol Rodriguez": {
    name: "Imanol Rodriguez",
    record: "7-1-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "67\"",
    height: "5' 6\"",
    weight: "125 lbs",
    age: 26,
    nationality: "Mexico",
    wins: 7,
    losses: 1,
    draws: 0,
    noContests: 0
  },
  "Matt Schnell": {
    name: "Matt Schnell",
    record: "17-10-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 6\"",
    weight: "125 lbs",
    age: 35,
    nationality: "USA",
    wins: 17,
    losses: 10,
    draws: 0,
    noContests: 0
  },
  "Bruno Silva": {
    name: "Bruno Silva",
    record: "15-8-2",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 7\"",
    weight: "125 lbs",
    age: 31,
    nationality: "Brazil",
    wins: 15,
    losses: 8,
    draws: 2,
    noContests: 0
  },
  "Edgar Chairez": {
    name: "Edgar Chairez",
    record: "13-6-0",
    division: "Flyweight",
    stance: "Orthodox",
    reach: "66\"",
    height: "5' 5\"",
    weight: "125 lbs",
    age: 27,
    nationality: "Mexico",
    wins: 13,
    losses: 6,
    draws: 0,
    noContests: 0
  },
  "Jeisla Chaves": {
    name: "Jeisla Chaves",
    record: "7-0-0",
    division: "Women's Flyweight",
    stance: "Orthodox",
    reach: "66\"",
    height: "5' 5\"",
    weight: "125 lbs",
    age: 25,
    nationality: "Brazil",
    wins: 7,
    losses: 0,
    draws: 0,
    noContests: 0
  },
  "Yuneisy Duben": {
    name: "Yuneisy Duben",
    record: "6-1-0",
    division: "Women's Flyweight",
    stance: "Orthodox",
    reach: "65\"",
    height: "5' 4\"",
    weight: "125 lbs",
    age: 24,
    nationality: "Venezuela",
    wins: 6,
    losses: 1,
    draws: 0,
    noContests: 0
  },

  // UFC Freedom 250: Topuria vs Gaethje
  "Ilia Topuria": {
    name: "Ilia Topuria",
    nickname: "El Matador",
    record: "17-0-0",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "69\"",
    height: "5' 7\"",
    weight: "155 lbs",
    age: 27,
    nationality: "Georgia",
    wins: 17,
    losses: 0,
    draws: 0,
    noContests: 0
  },
  "Justin Gaethje": {
    name: "Justin Gaethje",
    nickname: "The Highlight",
    record: "27-5-0",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "70\"",
    height: "5' 11\"",
    weight: "155 lbs",
    age: 35,
    nationality: "USA",
    wins: 27,
    losses: 5,
    draws: 0,
    noContests: 0
  },
  "Alex Pereira": {
    name: "Alex Pereira",
    nickname: "Poatan",
    record: "13-3-0",
    division: "Heavyweight",
    stance: "Southpaw",
    reach: "80\"",
    height: "6' 4\"",
    weight: "265 lbs",
    age: 37,
    nationality: "Brazil",
    wins: 13,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Ciryl Gane": {
    name: "Ciryl Gane",
    nickname: "Bon Gamin",
    record: "13-2-0",
    division: "Heavyweight",
    stance: "Orthodox",
    reach: "81\"",
    height: "6' 5\"",
    weight: "265 lbs",
    age: 34,
    nationality: "France",
    wins: 13,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Sean O'Malley": {
    name: "Sean O'Malley",
    nickname: "Suga",
    record: "19-3-0",
    division: "Bantamweight",
    stance: "Switch",
    reach: "69\"",
    height: "5' 9\"",
    weight: "135 lbs",
    age: 29,
    nationality: "USA",
    wins: 19,
    losses: 3,
    draws: 0,
    noContests: 0
  },
  "Aiemann Zahabi": {
    name: "Aiemann Zahabi",
    record: "14-2-0",
    division: "Bantamweight",
    stance: "Orthodox",
    reach: "68\"",
    height: "5' 8\"",
    weight: "135 lbs",
    age: 32,
    nationality: "Canada",
    wins: 14,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Mauricio Ruffy": {
    name: "Mauricio Ruffy",
    record: "13-2-0",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "71\"",
    height: "5' 9\"",
    weight: "155 lbs",
    age: 28,
    nationality: "Brazil",
    wins: 13,
    losses: 2,
    draws: 0,
    noContests: 0
  },
  "Michael Chandler": {
    name: "Michael Chandler",
    nickname: "Iron",
    record: "23-10-0",
    division: "Lightweight",
    stance: "Orthodox",
    reach: "71\"",
    height: "5' 8\"",
    weight: "155 lbs",
    age: 38,
    nationality: "USA",
    wins: 23,
    losses: 10,
    draws: 0,
    noContests: 0
  },
  "Bo Nickal": {
    name: "Bo Nickal",
    record: "8-1-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "73\"",
    height: "6' 1\"",
    weight: "185 lbs",
    age: 27,
    nationality: "USA",
    wins: 8,
    losses: 1,
    draws: 0,
    noContests: 0
  },
  "Kyle Daukaus": {
    name: "Kyle Daukaus",
    record: "17-4-0",
    division: "Middleweight",
    stance: "Orthodox",
    reach: "74\"",
    height: "6' 0\"",
    weight: "185 lbs",
    age: 30,
    nationality: "USA",
    wins: 17,
    losses: 4,
    draws: 0,
    noContests: 0
  },
  "Diego Lopes": {
    name: "Diego Lopes",
    record: "27-8-0",
    division: "Featherweight",
    stance: "Orthodox",
    reach: "70\"",
    height: "5' 9\"",
    weight: "145 lbs",
    age: 33,
    nationality: "Brazil",
    wins: 27,
    losses: 8,
    draws: 0,
    noContests: 0
  },
  "Steve Garcia": {
    name: "Steve Garcia",
    record: "19-5-0",
    division: "Featherweight",
    stance: "Orthodox",
    reach: "71\"",
    height: "5' 10\"",
    weight: "145 lbs",
    age: 31,
    nationality: "USA",
    wins: 19,
    losses: 5,
    draws: 0,
    noContests: 0
  }
}

// Event data with proper fight ordering
const eventsData: EventData[] = [
  {
    name: "UFC Fight Night: Della Maddalena vs Prates",
    date: new Date("2026-05-02T07:00:00Z"), // 7:00 AM EDT
    location: "Perth, Western Australia, Australia",
    venue: "RAC Arena",
    isPpv: false,
    fights: [
      {
        fighter1: "Jack Della Maddalena",
        fighter2: "Carlos Prates",
        weightClass: "Welterweight",
        isMainEvent: true,
        isTitleFight: false,
        rounds: 5,
        position: 1
      },
      {
        fighter1: "Beneil Dariush",
        fighter2: "Quillan Salkilld",
        weightClass: "Lightweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 2
      },
      {
        fighter1: "Tim Elliott",
        fighter2: "Steve Erceg",
        weightClass: "Flyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 3
      },
      {
        fighter1: "Jacob Malkoun",
        fighter2: "Gerald Meerschaert",
        weightClass: "Middleweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 4
      },
      {
        fighter1: "Tai Tuivasa",
        fighter2: "Sean Sharaf",
        weightClass: "Heavyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 5
      },
      // Prelims
      {
        fighter1: "Junior Tafa",
        fighter2: "Kevin Christian",
        weightClass: "Light Heavyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 6
      },
      {
        fighter1: "Kody Steele",
        fighter2: "Dom Mar Fan",
        weightClass: "Lightweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 7
      }
    ]
  },
  {
    name: "UFC 328: Chimaev vs Strickland",
    date: new Date("2026-05-09T21:00:00Z"), // 9:00 PM EDT
    location: "Newark, New Jersey, United States",
    venue: "Prudential Center",
    isPpv: true,
    fights: [
      {
        fighter1: "Khamzat Chimaev",
        fighter2: "Sean Strickland",
        weightClass: "Middleweight",
        isMainEvent: true,
        isTitleFight: true,
        rounds: 5,
        position: 1
      },
      {
        fighter1: "Joshua Van",
        fighter2: "Tatsuro Taira",
        weightClass: "Flyweight",
        isMainEvent: false,
        isTitleFight: true,
        rounds: 5,
        position: 2
      },
      {
        fighter1: "Alexander Volkov",
        fighter2: "Waldo Cortes-Acosta",
        weightClass: "Heavyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 3
      },
      {
        fighter1: "Sean Brady",
        fighter2: "Joaquin Buckley",
        weightClass: "Welterweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 4
      },
      {
        fighter1: "King Green",
        fighter2: "Jeremy Stephens",
        weightClass: "Lightweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 5
      },
      // Prelims
      {
        fighter1: "Jan Blachowicz",
        fighter2: "Bogdan Guskov",
        weightClass: "Light Heavyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 6
      },
      {
        fighter1: "Ateba Gautier",
        fighter2: "Ozzy Diaz",
        weightClass: "Middleweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 7
      },
      {
        fighter1: "Roman Kopylov",
        fighter2: "Marco Tulio",
        weightClass: "Middleweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 8
      },
      {
        fighter1: "Clayton Carpenter",
        fighter2: "Jose Ochoa",
        weightClass: "Flyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 9
      },
      {
        fighter1: "Baisangur Susurkaev",
        fighter2: "Djorden Santos",
        weightClass: "Middleweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 10
      }
    ]
  },
  {
    name: "UFC Fight Night: Allen vs Costa",
    date: new Date("2026-05-16T20:00:00Z"), // 8:00 PM EDT
    location: "Las Vegas, Nevada, United States",
    venue: "UFC APEX",
    isPpv: false,
    fights: [
      {
        fighter1: "Arnold Allen",
        fighter2: "Melquizael Costa",
        weightClass: "Featherweight",
        isMainEvent: true,
        isTitleFight: false,
        rounds: 5,
        position: 1
      },
      {
        fighter1: "Ketlen Vieira",
        fighter2: "Jacqueline Cavalcanti",
        weightClass: "Women's Bantamweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 2
      },
      {
        fighter1: "Modestas Bukauskas",
        fighter2: "Rodolfo Bellato",
        weightClass: "Light Heavyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 3
      },
      {
        fighter1: "Tuco Tokkos",
        fighter2: "Ivan Erslan",
        weightClass: "Light Heavyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 4
      },
      {
        fighter1: "Timmy Cuamba",
        fighter2: "Benardo Sopaj",
        weightClass: "Bantamweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 5
      },
      // Prelims
      {
        fighter1: "Alice Ardelean",
        fighter2: "Polyana Viana",
        weightClass: "Women's Strawweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 6
      },
      {
        fighter1: "Daniel Barez",
        fighter2: "Luis Gurule",
        weightClass: "Flyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 7
      }
    ]
  },
  {
    name: "UFC Fight Night: Song vs Figueiredo",
    date: new Date("2026-05-30T07:00:00Z"), // 7:00 AM EDT
    location: "Macau, China",
    venue: "Galaxy Arena",
    isPpv: false,
    fights: [
      {
        fighter1: "Song Yadong",
        fighter2: "Deiveson Figueiredo",
        weightClass: "Bantamweight",
        isMainEvent: true,
        isTitleFight: false,
        rounds: 5,
        position: 1
      },
      {
        fighter1: "Zhang Mingyang",
        fighter2: "Alonzo Menifield",
        weightClass: "Light Heavyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 2
      },
      {
        fighter1: "Sergei Pavlovich",
        fighter2: "Tallison Teixeira",
        weightClass: "Heavyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 3
      },
      {
        fighter1: "Alex Perez",
        fighter2: "Sumudaerji",
        weightClass: "Flyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 4
      },
      {
        fighter1: "Kai Asakura",
        fighter2: "Cameron Smotherman",
        weightClass: "Bantamweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 5
      },
      {
        fighter1: "Muslim Salikhov",
        fighter2: "Jake Matthews",
        weightClass: "Welterweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 6
      },
      {
        fighter1: "Angela Hill",
        fighter2: "Jingnan Xiong",
        weightClass: "Women's Strawweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 7
      }
    ]
  },
  {
    name: "UFC Fight Night: Muhammad vs Bonfim",
    date: new Date("2026-06-06T18:00:00Z"), // 6:00 PM EDT
    location: "Las Vegas, Nevada, United States",
    venue: "UFC APEX",
    isPpv: false,
    fights: [
      {
        fighter1: "Belal Muhammad",
        fighter2: "Gabriel Bonfim",
        weightClass: "Welterweight",
        isMainEvent: true,
        isTitleFight: false,
        rounds: 5,
        position: 1
      },
      {
        fighter1: "Iwo Baraniewski",
        fighter2: "Billy Elekana",
        weightClass: "Light Heavyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 2
      },
      {
        fighter1: "Imanol Rodriguez",
        fighter2: "Matt Schnell",
        weightClass: "Flyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 3
      },
      {
        fighter1: "Bruno Silva",
        fighter2: "Edgar Chairez",
        weightClass: "Flyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 4
      },
      {
        fighter1: "Jeisla Chaves",
        fighter2: "Yuneisy Duben",
        weightClass: "Women's Flyweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 5
      }
    ]
  },
  {
    name: "UFC Freedom 250: Topuria vs Gaethje",
    date: new Date("2026-06-14T20:00:00Z"), // 8:00 PM EDT
    location: "Washington, D.C., United States",
    venue: "The White House",
    isPpv: true,
    fights: [
      {
        fighter1: "Ilia Topuria",
        fighter2: "Justin Gaethje",
        weightClass: "Lightweight",
        isMainEvent: true,
        isTitleFight: true,
        rounds: 5,
        position: 1
      },
      {
        fighter1: "Alex Pereira",
        fighter2: "Ciryl Gane",
        weightClass: "Heavyweight",
        isMainEvent: false,
        isTitleFight: true,
        rounds: 5,
        position: 2
      },
      {
        fighter1: "Sean O'Malley",
        fighter2: "Aiemann Zahabi",
        weightClass: "Bantamweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 3
      },
      {
        fighter1: "Mauricio Ruffy",
        fighter2: "Michael Chandler",
        weightClass: "Lightweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 4
      },
      {
        fighter1: "Bo Nickal",
        fighter2: "Kyle Daukaus",
        weightClass: "Middleweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 5
      },
      {
        fighter1: "Diego Lopes",
        fighter2: "Steve Garcia",
        weightClass: "Featherweight",
        isMainEvent: false,
        isTitleFight: false,
        rounds: 3,
        position: 6
      }
    ]
  }
]

async function seedUfcEvents() {
  console.log('🥊 Seeding UFC Events with Proper Fight Ordering...\n')

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await prisma.oddsSnapshot.deleteMany()
    await prisma.fight.deleteMany()
    await prisma.event.deleteMany()
    await prisma.fighterCache.deleteMany()
    console.log('✅ Data cleared successfully')

    // Seed fighters
    console.log('\n👊 Seeding fighters...')
    const fighterMap = new Map<string, string>()
    
    for (const [name, data] of Object.entries(fighterDatabase)) {
      const fighter = await prisma.fighterCache.create({
        data: {
          ...data,
          externalId: null,
        }
      })
      fighterMap.set(name, fighter.id)
      console.log(`   ✓ Created fighter: ${name}`)
    }

    // Seed events and fights
    console.log('\n🎫 Seeding events and fights...')
    
    for (const eventData of eventsData) {
      console.log(`\n📅 Processing event: ${eventData.name}`)
      
      // Create event
      const event = await prisma.event.create({
        data: {
          name: eventData.name,
          date: eventData.date,
          location: eventData.location,
          venue: eventData.venue,
          status: 'upcoming',
          promotion: 'UFC',
          isPpv: eventData.isPpv,
        }
      })
      
      console.log(`   ✓ Created event: ${eventData.name}`)
      
      // Create fights in proper order
      const orderedFights = eventData.fights.sort((a, b) => a.position - b.position)
      
      for (const fightData of orderedFights) {
        const fighter1Id = fighterMap.get(fightData.fighter1)
        const fighter2Id = fighterMap.get(fightData.fighter2)
        
        if (!fighter1Id || !fighter2Id) {
          console.error(`   ❌ Missing fighter IDs for ${fightData.fighter1} vs ${fightData.fighter2}`)
          continue
        }

        const fight = await prisma.fight.create({
          data: {
            eventId: event.id,
            fighter1Id,
            fighter2Id,
            weightClass: fightData.weightClass,
            isMainEvent: fightData.isMainEvent,
            isTitleFight: fightData.isTitleFight,
            rounds: fightData.rounds,
            position: fightData.position,
            status: 'upcoming',
          }
        })
        
        console.log(`   ✓ Created fight ${fightData.position}: ${fightData.fighter1} vs ${fightData.fighter2}`)
      }
    }

    console.log('\n✅ UFC Events seeded successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Events: ${eventsData.length}`)
    console.log(`   - Fighters: ${Object.keys(fighterDatabase).length}`)
    console.log(`   - Total Fights: ${eventsData.reduce((sum, event) => sum + event.fights.length, 0)}`)
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeding script
seedUfcEvents()

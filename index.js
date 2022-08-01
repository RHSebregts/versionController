#!/user/bin/env node

// Propgram to switch versions based on git tags
// Inspired by Fireship.io
// Made by Robbert-Jan Sebregts - 07-2022

import inquirer from "inquirer";
import chalkAnimation from "chalk-animation"
import { createSpinner } from "nanospinner";
import * as dotenv from 'dotenv'
import { simpleGit, CleanOptions } from 'simple-git';

simpleGit().clean(CleanOptions.FORCE);

dotenv.config()

let SimpleGit;
const apps = JSON.parse(process.env.PROGRAMS)
const appObjects = apps.map(app => {return {name : app.program, value : {name : app.program, dir : app.directory}}})
const spinner = createSpinner()

const sleep = (ms = 2000) => new Promise((r)=> setTimeout(r, ms))
const quitAnswer = {name : '🛑 Stop Version Controller ✋', value : 'quit'}
async function welcome(){
    const rainbowTitle = chalkAnimation.rainbow('Welcome to version controller!')
    await sleep(200)
    rainbowTitle.stop()
}

async function versionController(){
    const selectedProgram = await selectProgram()
    const commits = await getCommits(selectedProgram)
    const selectedCommit = await selectVersion(commits)
    const {confirmUpdate} = await confirmVersion(selectedCommit)
    if(!confirmUpdate){
        spinner.error({text : `Version Change aborted.`})
        await sleep(500)
        process.exit(1)
    }
    const changeVersionError = await gitVersionChange(selectedCommit)
    const endProgram = handleEnd(changeVersionError)
    return endProgram
}
const checkForStop = async (quit)=>{
    if(quit === 'quit'){
        spinner.error({text : `Stopping Version Controller!`})
        await sleep(500)
        process.exit(0)
    }
}
async function selectProgram() {
    const answers = await inquirer.prompt({
        name : 'program',
        type : 'list',
        message : 'Which program do you want to change the version of?',
        choices : [...appObjects, quitAnswer],
    })
    await checkForStop(answers.program)
    return answers.program
}
async function getCommits(selectedProgram){
    const gitOptions = getGitOptions(selectedProgram)
    SimpleGit = await simpleGit(gitOptions.gitOptions)
    const status = await SimpleGit.raw('describe')
    const tags = await SimpleGit.tags()
    // const commits = await SimpleGit.log(gitOptions.logOptions)
    // const versionRegEx = new RegExp(process.env.REGEX || /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/)
    const tagList = tags.all.reverse()
    .map(tag => {
            return {name : tag,  value : {...selectedProgram, version : tag, previousVersion : status}}
    })
    return {tagList, status }
}

const getGitOptions = (repoLocation)=>{
    return {
        gitOptions : {
        baseDir : repoLocation.dir,
        binary : 'git',
        maxConcurrentProcesses : 6,
        }, 
         logOptions : {format : { hash : '%H', subject : '%s', authorDateRel : '%ar', authorDate : '%aD',}}
    }
}

async function selectVersion(commits){
    const answers = await inquirer.prompt({
        name: 'info',
        type : 'rawlist',
        message : `Which version would you like to go to?\nCurrent version is ${commits.status}`,
        choices : [...commits.tagList, quitAnswer],
        loop: false
    })
    await checkForStop(answers.info)
    return answers
}

async function confirmVersion(commit) {
    const answers = await inquirer.prompt({
        name : 'confirmUpdate',
        type : 'confirm',
        message : `Are you sure you want to update to version ${commit.info.version}?`,
    })
    return answers
}

async function gitVersionChange(commit){
    return SimpleGit.checkout(`tags/${commit.info.version}`)
}

async function handleEnd(changeVersionError){
    if(changeVersionError){
        spinner.error({text : `Something went wrong, please try again.`})
        process.exit(1)
    } else{
        const currentVersion = await SimpleGit.raw('describe')
        spinner.success({text : `Succesfully changed version to ${currentVersion}\nThank you for using Version Controller!\n`})
        process.exit(0)
    }
}

await welcome()
await versionController()
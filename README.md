# dedCLI
My very own watch_d0gs themed CLI app for my personal use but can be modified for friends to use! (Kinda useful for ppl who do ctfs or usually like automating things.)
<br />
More features on the way!
![mainmenu](https://github.com/user-attachments/assets/cbbcc87d-f3ff-47f8-8b80-c5055dd06c04)

# How to use?

Well, since this is a very early build, try opening the terminal in the folder you downloaded this repo in and then use the command `node .` to run. 
<br />
If you want to automate it opening on startup, here are the steps:
- Open Task Scheduler.
- Click on 'Create Task' in the `Actions` Tab
- Give it a name: let's say 'dedCLI'
<<<<<<< HEAD
- In the bottom right, select `Windows 10` (dw this setting works for windows 11 too) in the `Configure` menu.
- In the `Triggers` tab, select `New` and then select `On Startup` in`Begin the Task`
=======
- In the bottom right, select `Windows 10` in the `Configure` menu.
- In the `Triggers` tab, select `New` and then select `On Log In` in`Begin the Task`
>>>>>>> 1930df246a04530a380e2a6ed079d52a2529bd59
- In the `Actions` tab, select `New` and then under `Program/script` enter `"C:\Windows\System32\cmd.exe" /k cd "C:\your\path\to\this\repo" && node .`
- Save these settings and voila! You are now a really c00L hackermans/womans! 
<br />
Make sure you have node js installed in your computer, how to do this you ask? go watch a tutorial :)). This project may become an npx executable in the future but thats too far for now.
- Only works on w1nd0ws :))

# Current Features
- Opens Spotify ('cause why not?)<br />
- Has a method for producing a STEP decoy (opens np++ or intelliJ instantly if it exists on your pc 😋) <br />
- Starts up my very own To Do List site for making well, todo lists! <br/>
- CTF tools opener  for my fellow CTF players (opens deepseek, dogbolt and cyberchef) <br />
- Placeholder! (shows you a cool terminal art that can just be a cool screenspace to flex)<br />

# Upcoming Features (under dev)
- CTF Tools update (extra functionality) <br />
- Cool little Minigame <br />
- Package Manager and Updater once I convert this into a package <br />
- Easter Eggs <br />
- Custom Commands and many more!

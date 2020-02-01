# Project 1

## Basic game idea
I want to make a space shooter like Space Invaders

## Technology
- HTML
- CSS
- JavaScript

I want to use basic HTML and CSS for the layout on a single page, a canvas for the game presentation and plain JavaScript for th logic.
    
## MVP
 
- The application consists of a single HTML file which has a button to start a new game, or pause the current one.
    - The player side:
        - Show a square that represents the player
        - Move the player square according to keyboard inputs
        - Launch a projectile to attack the enemy
        - Die if hit by an enemy projectile and  hit points get below 1

    - The enemy side:
        - Show one ore more squares to represent the enemy side in the top 2 thirds of the game screen
        - Move the player square according to keyboard inputs
        - Occasionally attack the player with projectiles
        - Die if hit by a player projectile and hit points get below 1

- If the player died, end the current game and show a game over message
- If all enemies died, end the current game and show a board cleared message
- Ask if the player wants to play again

## Stretch goals
- Have multiple levels for the player to go through 
- Increase difficulty with each level by introducing more frequent attacks
- Increase difficulty with each level by making the enemy move towards the player
- Enemies may move horizontally to avoid getting hit
- Have different types of enemies who have more hit points and different colors
- Player can collect different weapon types that enemies drop after death
- Player can collect different disadvantages that enemies drop after death 
e.g. slower movement

## Wireframe
![](https://i.imgur.com/rwCMFGh.png)
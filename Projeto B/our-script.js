/**
 * Code that executes when a click happens inside the grid.
 *
 * @param {Object} interaction -  
 * @param {number} interaction.x - The X coordinate of the click
 * @param {number} interaction.y - The Y coordinate of the click
 * @param {HTMLElement} interaction.target - The DOM node that received the click.
 * @param {string} interaction.class - Either 'goal-0' if the user clicked the current target or 'goal-1' if they clicked the one after that.
 * @param {number} interaction.distance - The distance between the click and the center of the current target
 * @param {number} interaction.elapsed - The time elapsed since the previous click
 * @param {'success'|'failure'|'mistake'} interaction.type - The click result
 * Notice that the X and Y coordinates are with regard to the grid. Thus, (0, 0) is the top left corner of the grid.
 */


function processClick(interaction) {
    //
}

/**
 * Code that executes when the sequence ends (the user has clicked he last
 * target)
 *
 * @param performance An object that describes the performance of the user. It
 * contains the following fields:
 * - age: The age of the user, which was given by them at the start of the
 *   exercise
 * - elapsed: The total time since the user was shown the first target
 * - successes: The number of successful clicks
 * - failures: The number of failed clicks (on wrong targets)
 * - mistakes: The number of clicks inside the grid but outside any target
 * - interactions: An array with the interactions made by the user.
 *
 * For a description of an interaction, see the documentation of the
 * `processClick` function
 */
function processEnd(performance) {
    //
}

document.addEventListener('DOMContentLoaded', () => {
    // Code here executes after the page finishes loading.
});

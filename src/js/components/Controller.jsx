// const controllerManager = (() => {
//     const container = document.querySelector('.display .controller');

//     if (!container) {
//         return;
//     }

//     const bindings = {
//         ls: container.querySelector('.button.LS'),
//         rs: container.querySelector('.button.RS'),
//         up: container.querySelector('.button.U'),
//         down: container.querySelector('.button.D'),
//         left: container.querySelector('.button.L'),
//         right: container.querySelector('.button.R'),
//         start: container.querySelector('.button.start'),
//         select: container.querySelector('.button.select'),
//         x: container.querySelector('.button.X'),
//         a: container.querySelector('.button.A'),
//         b: container.querySelector('.button.B'),
//         y: container.querySelector('.button.Y'),
//     };

//     const map = {
//         0: bindings.up,
//         1: bindings.down,
//         2: bindings.left,
//         3: bindings.right,

//         4: bindings.start,
//         5: bindings.select,

//         8: bindings.ls,
//         9: bindings.rs,

//         11: bindings.b,
//         12: bindings.a,
//         13: bindings.y,
//         14: bindings.x,
//     };

//     const list = {};
//     const selector = controls.querySelector('.controller select');
//     let interval, active;

//     function activate(index) {
//         if (index === active) {
//             return;
//         }
//         deactivate();
//         if (list[index]) {
//             active = index;
//             interval = setInterval(update, 5);
//         }
//     }

//     function deactivate(index=null) {
//         if (index && active !== index) {
//             // if index was supplied
//             // then assume we only want to deactivate
//             // if the index is the active controller
//             return;
//         }
//         if (interval || active) {
//             clearInterval(interval);
//             interval = null;
//             active = null;
//         }
//     }

//     function add(event) {
//         const gamepad = event.gamepad;
//         list[gamepad.index] = gamepad;

//         const option = document.createElement('option');
//         option.value = gamepad.index;
//         option.innerHTML = gamepad.id;

//         selector.add(option);

//         if (gamepad.index === 0) {
//             selector.value = gamepad.index;
//             selector.dispatchEvent(new Event('change'));
//         }
//     }

//     function remove(event) {
//         const gamepad = event.gamepad;
//         deactivate(gamepad.index);

//         delete list[gamepad.index];

//         selector.querySelectorAll('option').forEach(option => {
//             if (option.value === 'None') {
//                 return;
//             }

//             if (parseInt(option.value) === gamepad.index) {
//                 selector.value = null;
//                 selector.dispatchEvent(new Event('change'));
//                 option.parentElement.removeChild(option);
//             }
//         });
//     }

//     function update() {
//         const activeController = list[active];
//         if (activeController) {
//             activeController.buttons.forEach(render);
//         }
//     }

//     function render(button, index) {
//         const mapped = map[index];
//         if (mapped) {
//             mapped.classList.toggle('active', button.pressed);
//         }
//     }

//     selector.addEventListener('change', event => {
//         activate(event.target.value);
//         container.classList.toggle('active', active !== null);
//     });

//     if ('GamepadEvent' in window) {
//         window.addEventListener('gamepadconnected', add);
//         window.addEventListener('gamepaddisconnected', remove);
//     }
// })();

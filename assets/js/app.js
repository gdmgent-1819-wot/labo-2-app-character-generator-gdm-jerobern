(function () {

  var app = {
    init: function () {
      console.log("Initilazing application");
      // Initialize Firebase
      this.config = {
        apiKey: "AIzaSyDaXCXy2Rc7rgL4Yq7mO_wJUL_pwZwVRnw",
        authDomain: "wot-1819-jerobern.firebaseapp.com",
        databaseURL: "https://wot-1819-jerobern.firebaseio.com",
        projectId: "wot-1819-jerobern",
        storageBucket: "wot-1819-jerobern.appspot.com",
        messagingSenderId: "196745075521"
      };
      firebase.initializeApp(this.config);

      this.row = 8;
      this.col = 8;
      this.size = 40;
      this.matrix = [];

      // Cache Div Element
      this.ledContainerElement = document.querySelector('.ledContainer');

      // event listeners for buttons
      const generateBtn = document.getElementById('generate');
      generateBtn.addEventListener('click', () => {
        this.createCharacterArcadeMatrix(this.row, this.col);
      })
      // event listeners for buttons
      const saveBtn = document.getElementById('save');
      saveBtn.addEventListener('click', () => {
        this.saveCharacterArcadeMatrix(this.matrix);
      })

      const characters = document.getElementById('characters');

      // Get a list of saved characters from firebase
      firebase.database().ref('characters').on('value', snapshot => {
        characters.innerHTML = '';
        snapshot.forEach(item => {
          characters.innerHTML += `<li id='${item.key}'>${item.key}</li>`;
        })

        // add click eventlistener to each li item
        const lis = document.querySelectorAll('li');
        const liItems = [].slice.call(lis);
        liItems.forEach(element => {
          element.addEventListener('click', () => {
            this.showSavedCharacter(element.id);
          });
        });
      });
    },

    createCharacterArcadeMatrix: function (row, col) {
      const blue = "(0, 0, 255)";
      const black = "(0, 0, 0)";
      let pattern = '';
      let led = '';
      this.matrix = [];
      // Generate bit-string
      for (i = 0; i < row; i++) {
        let tempStr = '';
        for (j = 0; j < col / 2; j++) {
          // Randomly generate 1 or 0
          tempStr += Math.round(Math.random());
        }
        // Add tempStr + reversre tempStr to pattern
        pattern += tempStr + tempStr.split("").reverse().join("");
      }
      for (i = 0; i < 64; i++) {
        let bit = parseInt(pattern.charAt(i));
        let color = (bit == 1) ? blue : black
        this.matrix.push(color)
      }

      // Render LEDs
      for (i = 0; i < row; i++) {
        for (j = 0; j < col; j++) {
          let bit = pattern.charAt((i * this.row) + j);
          let ledClass = (bit == 1) ? 'led--on' : 'led--off';
          let top = i * this.size;
          let left = j * this.size;
          led += `<div data-row=${i} data-col=${j} style="top:${top}px; left:${left}px; width:${this.size}px; height:${this.size}px" class="led ${ledClass}"></div>`;
          this.ledContainerElement.innerHTML = led;
        }
      }
      // add event listeners
      let leds = document.querySelectorAll('.led');
      let ledItems = [].slice.call(leds);

      ledItems.forEach(element => {
        element.addEventListener('click', () => {
          // calculate index based on row and col
          const index = parseInt(element.dataset.row) * 8 + parseInt(element.dataset.col);
          // update browser UI and led color matrix
          if (element.classList.contains('led--off')) {
            element.classList.remove('led--off');
            element.classList.add('led--on');
            this.matrix[index] = blue;
          } else if (element.classList.contains('led--on')) {
            element.classList.remove('led--on');
            element.classList.add('led--off');
            this.matrix[index] = black;
          }
          // upload new matrix to database
          firebase.database().ref('current_character').set(this.matrix);
        });
      });

      firebase.database().ref('current_character').set(this.matrix);
    },

    // Save created character to database
    saveCharacterArcadeMatrix: function (matrix) {
      if (matrix === undefined || matrix.length == 0) {
        console.log('Empty Character can not be saved');
      } else {
        firebase.database().ref('characters').push(matrix);
        console.log('Character saved to database!');
      }
    },

    // Show a saved character from database on Pi
    showSavedCharacter: function (key) {
      firebase.database().ref('characters/' + key).once('value')
        .then(snapshot => {
          firebase.database().ref('current_character').set(snapshot.val());
          console.log(`Showing character on Pi with id: ${key}`);
        });
    }
  }
  app.init();
})();
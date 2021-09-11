//1 - получаем данныу из json
function getData() {
  return fetch('data.json')
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Данные не были получены' + response.status);
      }
    })
    .catch(err => {
      console.warn(err);
      document.body.innerHTML = '<div style="color: red; font-size: 40px; ">Что-то пошло не так</div>';
    });
}

//2 - разбиваем массив на подмассивы
function splitArray(arr, arraySize = 10) {
  const subarray = [],
        subarrayAmount = Math.ceil(arr.length / arraySize);
  
  for (let i = 0; i < subarrayAmount; i++) {
    subarray[i] = arr.slice((i * arraySize), (i * arraySize) + arraySize);
  }
  
  return subarray;
}
//3-функция закрашивает ячейку "цвет глаз" в соотвутсвующий цвет. 
//Создает внутри ячейки div с фоновым цветом и цветом текста равные цвету глаз, заданный в ячейке
function color (value) {
  const coloredEye = document.createElement('div');

  coloredEye.className = 'colored-eye';
  coloredEye = value.innerHTML;
  value.innerHTML = '';
  value.append(coloredEye);
  value.firstChild.style.cssText = `background-color: ${value.firstChild.innerHTML};`;
}

//4 - прорисовка таблицы. Создает строку таблицы с ячейками данных и добавляет их в tbody.
//При прорисовке данных в колонке "Описание" обрезает about до длины th "Описание" (aboutLength ) деленное на 4.
//aboutThLength / 5 примерно равно кол-ву символов, которые влезут 2-мя строками в ячейку about
function renderCell(jsonData, pagNum = 1) {
  localStorage.getItem('jsonData') ? '' : localStorage.setItem('jsonData', JSON.stringify(jsonData));
  
  const data = localStorage.getItem('jsonData') ? JSON.parse( localStorage.getItem('jsonData') ) : jsonData,
        tableData = document.querySelector('#myTable'),
        aboutTh = document.querySelector('.about'),
        aboutThLength = aboutTh.clientWidth,
        peopleCards = splitArray(data.JSON)[pagNum - 1];
  
  tableData.innerHTML = '';

  peopleCards.forEach((element) => {
    const rowTable = document.createElement('tr');

    rowTable.setAttribute('id', element.id);
    rowTable.className = 'data-row';
    rowTable.innerHTML = `
        <td class='first-name _cell' data-type='text'>${element.name.firstName}</td>
        <td class='last-name _cell' data-type='text'>${element.name.lastName}</td>
        <td class='about _cell' data-type='text'>${element.about.slice(0, (aboutThLength / 4 )) + '...'}</td>
        <td class='eye-color _cell' data-type='text'>${color}</td>
    `;

    tableData.append(rowTable);
    
    const td = rowTable.querySelector('.eye-color');
    color(td); // функция закрашивает ячейку "цвет глаз" в соотвутсвующий цвет
  });
}


// 5 - сортировка по столбцам
//получаем ячейки шапки таблицы и вешаем на них событие клик
let tableTh = document.getElementsByTagName('th')
//так как с помощью getElementsByTagName мы получили псевдомассив, проходимся по нему перебором
for (let element of tableTh) {
  element.addEventListener('click', function () {
      
//получаем значения атрибутов ячеек шапки таблицы, чтобы отслеживать, на какую из них кликнул пользователь
    let column = element.getAttribute('data-column')
    let order = element.getAttribute('data-order')
    console.log('Column was clicked', column, order)

    if (column==="firstName" || column==="lastName" || column==="about" || column==="eyeColor") {
      if (order ==='desc') {
        element.setAttribute('data-order', "asc")
        copy = copy.sort((a,b)=> a[column] > b[column] ? 1 : -1)
      } 
      else {
         element.setAttribute('data-order', "desc")
         copy = copy.sort((a,b)=> a[column] < b[column] ? 1 : -1)
       }
    buildTable(copy)


  }

  })
}
//6 -функция отрисовывает пагинацию и вызывает колбэком функицю отрисовки страницы, выбранной в пагинации 
function renderPagination(jsonData) {
  const data = localStorage.getItem('jsonData') ? JSON.parse( localStorage.getItem('jsonData') ) : jsonData,
        table = document.querySelector('.table'),
        pageCount = splitArray(data.JSON).length,
        pagination = document.createElement('div'),
        pagTitile = document.createElement('span');
  
  pagination.className = 'pagination';
  pagTitile.textContent = 'Пагинация:';
  pagination.append(pagTitile);

  for (let i = 0; i < pageCount; i++) {
      const pagNum = document.createElement('div');

      pagNum.className = 'pagination-number';
      pagNum.innerHTML = i + 1;

      if (i === 0) pagNum.classList.add('current-pagination');
      
      pagination.append(pagNum);
  }
  
  table.insertAdjacentElement('beforebegin', pagination);

  renderActivePage(data);
}

//7 - скрытие колонок
// скрытие всех колонок
function hideAllColumns() {
  const btnHide = document.querySelector('.btn_hidden_all')
  

  btnHide.addEventListener('click', function () {
    if (!table.dataset.hidden || table.dataset.hidden === 'off') {
      table.setAttribute('data-hidden', 'on');
      btnHide.innerHTML = 'Показать все колонки';
      table.style.display = 'none';
    } else if (table.dataset.hidden === 'on') {
      table.setAttribute('data-hidden', 'off');
      btnHide.innerHTML = 'Скрыть все колонки';
      table.style.display = '';
    }
  });
  
}


//Скрытие выбранной колонки
function hideColumn() {
  const hiddenBtns = document.querySelectorAll('.btn_hidden'),
        table = document.querySelector('.table');

  hiddenBtns.forEach((item, i) => {
    item.addEventListener('click', () => {
      //проверка чему равен data-hidden у span внутри кнопки, которая содержит в себе иконку "показать/скрыть"
      if (item.children[0].dataset.hidden === 'off') {
        item.children[0].setAttribute('data-hidden', 'on'); //заменяет иконку "показать" на иконку "скрыть"
        table.classList.add(`hidden-${i+1}`);
      } else if (item.children[0].dataset.hidden === 'on') {
        item.children[0].setAttribute('data-hidden', 'off'); //заменяет иконку "скрыть" на иконку "показать"
        table.classList.remove(`hidden-${i+1}`);
      }

      //перерисовывает таблицу при скрытии колонки
      getData().then(() => {
        renderCell( JSON.parse( localStorage.getItem('jsonData') ) );
      });
    })
  })
}

// 8 - редактирование 
//Форма редактирования
function editTableData() {
  const table = document.querySelector('table'),
        editForm = document.querySelector('.form_wrapper'),
        inputs = editForm.querySelectorAll('input'),
        textarea = editForm.querySelector('textarea'),
        btnEdit = editForm.querySelector('.edit'),
        btnClose = editForm.querySelector('.close');

  let CHANGE_ROW; // строка tr которую нужно будет редактировать

  //Используется делегирование событий. При клике на таблицу получает строку по которой кликнули и отображает рядом с ней форму редактирования
  table.addEventListener('click', function(event) {
    const row = event.target.closest('.data-row'); //возвращает ближайщего предка соответствующего селектору.
    
    CHANGE_ROW = row;

    if (!row) return; //проверка, содержит ли в себе event.target строку row
    if (!table.contains(row)) return; //проверка, прендалежит ли row нашей таблице.

    editForm.style.cssText = `display: block;  top: ${row.offsetTop}px; left: ${row.offsetWidth + 20}px;`;

    inputs[0].value = row.cells[0].innerHTML;
    inputs[1].value = row.cells[1].innerHTML;
    textarea.value = row.cells[2].innerHTML.slice(0, row.cells[2].innerHTML.length - 3);
    inputs[2].value = row.cells[3].firstChild.innerHTML;
  });
  
  //При нажатии на кнопку редактирования btnEdit содержимое ячеек строки заменяется на содержимое формы
  btnEdit.addEventListener('click', () => {    
    const jsonData = JSON.parse( localStorage.getItem('jsonData') );
    //узнаем длину массива, что бы узнать arraySize из функции splitArray. На случай если сделаю чтобы юзер задавал значение arraySize
    const rowAmount = splitArray(jsonData.JSON).length; 
    const editedRow = {
      id: CHANGE_ROW.id ,
      name: {
        firstName: inputs[0].value,
        lastName: inputs[1].value,
      },
      phone: null,
      about: textarea.value,
      eyeColor: inputs[2].value,
    }

    let editedRowIndex = 0;

    jsonData.JSON.forEach((item, i, arr) => {
      if (item.id === CHANGE_ROW.id) {
        arr.splice(i, 1, editedRow);
        editedRowIndex = i + 1; 
      }
    })

    localStorage.setItem('jsonData', JSON.stringify(jsonData));
    editForm.style='';

    renderCell(jsonData, Math.ceil(editedRowIndex / (jsonData.JSON.length / rowAmount))); // (jsonData.length / rowAmount) - arraySize из функции splitArray
  });

  btnClose.addEventListener('click', () => editForm.style=''); // закрывает форму редактирования.
}

// 9 - перерисовываем таблицу при изменении размера окна
window.addEventListener('resize', () => {
  getData().then(() => {
    renderCell( JSON.parse( localStorage.getItem('jsonData') ) );
  });
});

//Сначала выполнится функция получения данных, затем все остальные
getData().then((jsonData) => {
  renderCell(jsonData);
  renderPagination(jsonData);

  editTableData();
  hideAllColumns();
  hideColumn();
});

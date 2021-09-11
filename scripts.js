//1 - получаем данных из json с помощью fetch-запроса
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

//функция, разбивающая массив на подмассивы
function splitArray(arr, arraySize = 10) {
  const subarray = [],
        subarrayAmount = Math.ceil(arr.length / arraySize);
  
  for (let i = 0; i < subarrayAmount; i++) {
    subarray[i] = arr.slice((i * arraySize), (i * arraySize) + arraySize);
  }
  
  return subarray;
}
//функция отрисовывает пагинацию и вызывает колбэком функицю отрисовки страницы, выбранной в пагинации 
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

//функция отрисовывает страницу, выбранную в пагинации
function renderActivePage(jsonData) {
  const pagNums = document.querySelectorAll('.pagination-number');
  
  pagNums.forEach((item, i) => {
      item.addEventListener('click', () => {
        markActivePageInPagination(i);
        renderCell(jsonData, i + 1);
      });
  })
}

//показывает/отмечает активную страницу на пагинации
function markActivePageInPagination(pagNum) {
  const pagNums = document.querySelectorAll('.pagination-number');

  pagNums.forEach((item, i) => {
    if (item.classList.contains('current-pagination') && i !== pagNum) {
      item.classList.remove('current-pagination');
    } else if (!item.classList.contains('current-pagination') && i === pagNum) {
      item.classList.add('current-pagination');
    }
  })
}
//4 - прорисовка таблицы. Создает строку таблицы с ячейками данных и добавляет их в tbody.
//При прорисовке данных в колонке "Описание" обрезает about до длины th "Описание" (aboutLength ) деленное на 5.
//aboutThLength / 5 примерно равно кол-ву символов, которые влезут 2-мя строками в ячейку about
function renderCell(jsonData, pagNum = 1) {
  localStorage.getItem('jsonData') ? '' : localStorage.setItem('jsonData', JSON.stringify(jsonData));
  
  const data = localStorage.getItem('jsonData') ? JSON.parse( localStorage.getItem('jsonData') ) : jsonData,
        tableData = document.querySelector('#myTable'),
        aboutTh = document.querySelector('.about'),
        aboutThLength = aboutTh.clientWidth,
        peopleCards = splitArray(data.JSON)[pagNums - 1];
  
  tableData.innerHTML = '';

  peopleCards.forEach((element) => {
    const rowTable = document.createElement('tr');

    rowTable.setAttribute('id', element.id);
    rowTable.className = 'data-row';
    rowTable.innerHTML = `
        <td class='first-name _cell' data-type='text'>${element.name.firstName}</td>
        <td class='last-name _cell' data-type='text'>${element.name.lastName}</td>
        <td class='about _cell' data-type='text'>${element.about.slice(0, (aboutThLength / 5 )) + '...'}</td>
        <td class='eye-color _cell' data-type='text'>${element.eyeColor}</td>
    `;

    tableData.append(rowTable);
    
   
  });
}


// 5 - сортировка по столбцам
//получаем ячейки шапки таблицы и вешаем на них событие клик
function eventSortTable() {
  const tableThs = document.querySelectorAll('th');

  tableThs.forEach((th, i) => {
    th.addEventListener('click', () => {
      checkSelectedTh(i); // убирает класс selected и data-атрибут у неактивных заголовочных ячеек таблицы

      if (!th.dataset.order || th.dataset.order === '-1') {
        th.setAttribute('data-order', 1);
      } else if (th.dataset.order === '1' ) {
        th.setAttribute('data-order', -1);
      }

      const order = th.dataset.order;
      th.classList.add('selected');
      
      sortTable(i, order); // функция сортировки данных в колонке таблицы
    })
  });
}
//функция sortTable() принимает индекс колонки которую нужно отсортировать и order, который используется

function sortTable(index, order) {
  const tableRows = document.querySelectorAll('.data-row'),
        tableData = document.querySelector('.main-data');

  const sortedRows = Array.from(tableRows).sort((rowA, rowB) => {
    return rowA.cells[index].innerHTML > rowB.cells[index].innerHTML ? order  : -order;
  });

  tableData.append(...sortedRows);
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

  let change_row; // строка tr которую нужно будет редактировать

  //Используется делегирование событий. При клике на таблицу получает строку по которой кликнули и отображает рядом с ней форму редактирования
  table.addEventListener('click', function(event) {
    const row = event.target.closest('.data-row'); //возвращает ближайщего предка соответствующего селектору.
    
  change_row = row;

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
      id: change_row.id ,
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
   eventSortTable();
  editTableData();
 
});

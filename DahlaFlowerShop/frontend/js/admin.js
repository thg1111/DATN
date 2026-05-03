//navbar dashboard
document.addEventListener("DOMContentLoaded", function() {
  const buttons = document.querySelectorAll(".button");
  const tabs = document.querySelectorAll(".tab-content"); 
  const homeDiv = document.querySelector("#home"); 

  if (homeDiv) {
      homeDiv.style.display = "block"; 
  }

  buttons.forEach(button => {
      button.addEventListener("click", function() {
          const tabId = button.getAttribute("data-tab"); 

          tabs.forEach(tab => {
              tab.classList.remove("active");
              tab.style.display = "none"; 
          });

          const activeTab = document.getElementById(tabId); 
          if (activeTab) {
              activeTab.classList.add("active");
              activeTab.style.display = "block"; 
          }
      });
  });
});

document.querySelectorAll('.ha li').forEach(item => {
    item.addEventListener('click', function () {
        // Xóa class 'active' khỏi tất cả các mục
        document.querySelectorAll('.ha li').forEach(i => i.classList.remove('active'));
        // Thêm class 'active' vào mục hiện tại
        item.classList.add('active');
    });
});



const sideLinks = document.querySelectorAll('.sidebar .side-menu li a i:not(.logout)');
sideLinks.forEach(item => {
    const li = item.parentElement;
    item.addEventListener('click', () => {
        sideLinks.forEach(i => {
            i.parentElement.classList.remove('active');
        })
        li.classList.add('active');
    })
});

const menuBar = document.querySelector('.content nav .bx.bx-menu');
const sideBar = document.querySelector('.sidebar');

menuBar.addEventListener('click', () => {
    sideBar.classList.toggle('close');
});

const searchBtn = document.querySelector('.content nav form .form-input button');
const searchBtnIcon = document.querySelector('.content nav form .form-input button .bx');
const searchForm = document.querySelector('.content nav form');

searchBtn.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault;
        searchForm.classList.toggle('show');
        if (searchForm.classList.contains('show')) {
            searchBtnIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchBtnIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        sideBar.classList.add('close');
    } else {
        sideBar.classList.remove('close');
    }
    if (window.innerWidth > 576) {
        searchBtnIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

const toggler = document.getElementById('theme-toggle');

toggler.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});



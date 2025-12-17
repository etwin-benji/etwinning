document.querySelectorAll('.fade').forEach(el => {
el.style.opacity = 0;
el.style.transform = 'translateY(30px)';


setTimeout(() => {
el.style.transition = '0.8s';
el.style.opacity = 1;
el.style.transform = 'translateY(0)';
}, 300);
});

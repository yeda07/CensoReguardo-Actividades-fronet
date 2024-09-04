import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
 
  {
    title: 'censo',
    path: '/censo',
    icon: icon('ic_user'),
  },
  {
    title: 'actividades',
    path: '/actividades',
    icon: icon('ic_cart'),
  },
  {
    title: 'Lista actualizacion  ',
    path: '/Lista',
    icon: icon('ic_cart'),
  },
  
  

];

export default navConfig;

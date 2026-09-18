import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'Personas',
    path: '/personas',
    icon: icon('ic_user'),
  },
  {
    title: 'Familias',
    path: '/familias',
    icon: icon('ic_blog'),
  },
  {
    title: 'Censo',
    path: '/censo',
    icon: icon('ic_user'),
  },
  {
    title: 'Actividades',
    path: '/actividades',
    icon: icon('ic_cart'),
  },

];

export default navConfig;

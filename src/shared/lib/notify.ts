import Notiflix from 'notiflix';

Notiflix.Notify.init({ position: 'right-bottom', timeout: 3500 });
Notiflix.Loading.init({ svgColor: '#6c47ff' });

export const notify = {
  success: (msg: string) => Notiflix.Notify.success(msg),
  error:   (msg: string) => Notiflix.Notify.failure(msg),
  warning: (msg: string) => Notiflix.Notify.warning(msg),
  info:    (msg: string) => Notiflix.Notify.info(msg),
  confirm: (
    title: string,
    msg: string,
    onOk: () => void,
    onCancel?: () => void
  ) => Notiflix.Confirm.show(title, msg, 'Confirmar', 'Cancelar', onOk, onCancel ?? (() => {})),
};

export const loading = {
  show: (msg = 'Cargando...') => Notiflix.Loading.standard(msg),
  hide: () => Notiflix.Loading.remove(),
};
const getRegExp = (type) => {
  const regExp = {};
  regExp.id = /^[a-z]+[a-z0-9]{8,15}$/g;
  regExp.password = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
  regExp.name = /^[가-힣]{2,8}$/;
  regExp.email = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
  return regExp[type];
};

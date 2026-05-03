using DAL;
using Microsoft.IdentityModel.Tokens;
using Model;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using BLL.Interface;
using DAL.Interfaces;

namespace BLL
{
    public class Feedback_BLL:bll_Feedback
    {
        private FeedbackReponsitory _res;
        private string Secret;
        public Feedback_BLL(FeedbackReponsitory res, IConfiguration configuration)
        {
            Secret = configuration["AppSetting:Secret"];
            _res = res;
        }
        public bool Delete(string FeedbackID)
        {
            return _res.Delete(FeedbackID);
        }
        public bool Create(Feedback_Model model)
        {
            return _res.Create(model);
        }
        public List<Feedback_Model> GetDataAll()
        {
            return _res.GetDataAll();
        }
    }
}

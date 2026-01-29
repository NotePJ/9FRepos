using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using HCBPCoreUI_Backend.Models;
using HCBPCoreUI_Backend.Attributes;

namespace HCBPCoreUI_Backend.Controllers;

/// <summary>
/// Home Controller - หน้าหลักของระบบ
/// ต้องการ Login ก่อนเข้าถึง
/// </summary>
[RequireAuth]
public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    [RequirePermission("PAGE_DASHBOARD")]
    public IActionResult Index()
    {
        return View();
    }

    [RequirePermission("PAGE_BUDGET")]
    public IActionResult Budget()
    {
        return View();
    }

    [RequirePermission("PAGE_BUDGET")]
    public IActionResult BudgetPlanning()
    {
        return View();
    }

    [RequirePermission("PAGE_PE")]
    public IActionResult BudgetPEBonus()
    {
        return View();
    }

    [RequirePermission("PAGE_PE")]
    public IActionResult BudgetPEHeadcount()
    {
        return View();
    }

    [RequirePermission("PAGE_PE")]
    public IActionResult BudgetPEManagement()
    {
        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

import { createServerClient } from '@/lib/auth'

export interface AccountBalance {
  id: string
  code: string
  name: string
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
  debit: number
  credit: number
  balance: number
}

export interface BalanceSheetData {
  assets: AccountBalance[]
  liabilities: AccountBalance[]
  equity: AccountBalance[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  isBalanced: boolean
}

export interface IncomeStatementData {
  income: AccountBalance[]
  expenses: AccountBalance[]
  totalIncome: number
  totalExpenses: number
  netIncome: number
}

export async function generateTrialBalance(
  companyId: string,
  startDate: string,
  endDate: string,
): Promise<AccountBalance[]> {
  const supabase = createServerClient()
  
  // Get all accounts for the company
  const { data: accounts, error: accountsError } = await (supabase as any)
    .from('accounts')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('code')

  if (accountsError) throw accountsError

  // Get all transaction entries for the date range
  const { data: entries, error: entriesError } = await (supabase as any)
    .from('transaction_entries')
    .select(`
      *,
      transaction:transactions!inner (
        date,
        company_id
      )
    `)
    .eq('transaction.company_id', companyId)
    .gte('transaction.date', startDate)
    .lte('transaction.date', endDate)

  if (entriesError) throw entriesError

  // Calculate balances for each account
  const accountBalances: AccountBalance[] = (accounts as any).map((account: any) => {
    const accountEntries = (entries as any).filter((entry: any) => (entry as any).account_id === (account as any).id)

    const debit = accountEntries.reduce((sum: any, entry: any) => sum + Number((entry as any).debit), 0)
    const credit = accountEntries.reduce((sum: any, entry: any) => sum + Number((entry as any).credit), 0)
    
    // Calculate balance based on account type
    let balance = 0
    if ((account as any).type === 'ASSET' || (account as any).type === 'EXPENSE') {
      balance = debit - credit
    } else {
      balance = credit - debit
    }

    return {
      id: (account as any).id,
      code: (account as any).code,
      name: (account as any).name,
      type: (account as any).type,
      debit,
      credit,
      balance,
    } as any
  })

  return accountBalances
}

export async function generateBalanceSheet(
  companyId: string,
  asOfDate: string,
): Promise<BalanceSheetData> {
  const trialBalance = await generateTrialBalance(companyId, '1900-01-01', asOfDate)
  
  const assets = (trialBalance as any).filter((account: any) => (account as any).type === 'ASSET' && (account as any).balance !== 0)
  const liabilities = (trialBalance as any).filter((account: any) => (account as any).type === 'LIABILITY' && (account as any).balance !== 0)
  const equity = (trialBalance as any).filter((account: any) => (account as any).type === 'EQUITY' && (account as any).balance !== 0)
  
  const totalAssets = assets.reduce((sum: any, account: any) => sum + (account as any).balance, 0)
  const totalLiabilities = liabilities.reduce((sum: any, account: any) => sum + (account as any).balance, 0)
  const totalEquity = equity.reduce((sum: any, account: any) => sum + (account as any).balance, 0)
  
  // Add retained earnings (net income from income statement)
  const incomeStatement = await generateIncomeStatement(companyId, '1900-01-01', asOfDate)
  const retainedEarnings = (incomeStatement as any).netIncome
  
  const finalTotalEquity = totalEquity + retainedEarnings
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + finalTotalEquity)) < 0.01

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity: finalTotalEquity,
    isBalanced,
  }
}

export async function generateIncomeStatement(
  companyId: string,
  startDate: string,
  endDate: string,
): Promise<IncomeStatementData> {
  const trialBalance = await generateTrialBalance(companyId, startDate, endDate)
  
  const income = (trialBalance as any).filter((account: any) => (account as any).type === 'INCOME' && (account as any).balance !== 0)
  const expenses = (trialBalance as any).filter((account: any) => (account as any).type === 'EXPENSE' && (account as any).balance !== 0)
  
  const totalIncome = income.reduce((sum: any, account: any) => sum + (account as any).balance, 0)
  const totalExpenses = expenses.reduce((sum: any, account: any) => sum + (account as any).balance, 0)
  const netIncome = totalIncome - totalExpenses

  return {
    income,
    expenses,
    totalIncome,
    totalExpenses,
    netIncome,
  }
}

export async function saveFinancialReport(
  companyId: string,
  reportType: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'TRIAL_BALANCE',
  startDate: string,
  endDate: string,
  data: any,
) {
  const supabase = createServerClient()
  
  const { error } = await (supabase as any)
    .from('financial_reports')
    .insert([{
      type: reportType,
      company_id: companyId,
      start_date: startDate,
      end_date: endDate,
      data,
    }])

  if (error) throw error
}

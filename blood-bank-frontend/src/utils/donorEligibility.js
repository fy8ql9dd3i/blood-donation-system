/**
 * Donor eligibility checker - calculates 90-day waiting period
 */

export const calculateDaysSinceDonation = (lastDonationDate) => {
    if (!lastDonationDate) return null
    const last = new Date(lastDonationDate)
    const now = new Date()
    const diffMs = now - last
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return diffDays
}

export const isEligibleToDonate = (donor) => {
    // Must be approved
    if (donor.status !== 'approved') return false

    // If never donated, eligible
    if (!donor.lastDonationDate) return true

    // Check 90-day rule
    const daysSince = calculateDaysSinceDonation(donor.lastDonationDate)
    return daysSince >= 90
}

export const daysUntilEligible = (donor) => {
    if (!donor.lastDonationDate) return 0
    const daysSince = calculateDaysSinceDonation(donor.lastDonationDate)
    if (daysSince >= 90) return 0
    return 90 - daysSince
}

export const getDonorEligibilityBadge = (donor) => {
    if (donor.status !== 'approved') {
        return { text: 'Pending approval', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: '⏳' }
    }

    if (!donor.lastDonationDate) {
        return { text: 'First-time eligible', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: '✅' }
    }

    const daysSince = calculateDaysSinceDonation(donor.lastDonationDate)
    if (daysSince >= 90) {
        return { text: 'Ready to donate', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: '✅' }
    }

    const remaining = 90 - daysSince
    return { text: `Eligible in ${remaining}d`, color: 'bg-slate-50 text-slate-600 border-slate-100', icon: '⏸️' }
}

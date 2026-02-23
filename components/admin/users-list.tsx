'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setSubscriberStatus, getUsersList } from '@/app/actions/subscriber'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'

interface User {
  id: string
  email: string | null
  nickname: string | null
  subscriber_verified: boolean
  purchase_serial_number: string | null
  verified_at: string | null
  subscriber_verification_request?: boolean
  verification_requested_at?: string | null
  created_at: string
}

interface UsersListProps {
  initialUsers: User[]
  searchQuery?: string
}

export function UsersList({ initialUsers, searchQuery = '' }: UsersListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [search, setSearch] = useState(searchQuery)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  const handleSearch = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const result = await getUsersList(search)
      if (result.success) {
        setUsers(result.data || [])
        // URL 업데이트
        const params = new URLSearchParams(searchParams.toString())
        if (search) {
          params.set('search', search)
        } else {
          params.delete('search')
        }
        router.push(`/admin/users?${params.toString()}`)
      } else {
        setMessage({ type: 'error', text: result.error || '사용자 목록을 불러오는데 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSubscriber = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId)
    setMessage(null)
    try {
      const result = await setSubscriberStatus(userId, !currentStatus)
      if (result.success) {
        // 서버에서 최신 데이터 다시 불러오기
        const refreshResult = await getUsersList(search)
        if (refreshResult.success && refreshResult.data) {
          setUsers(refreshResult.data)
        } else {
          // 새로고침 실패 시 로컬 상태만 업데이트
          setUsers(users.map(user => 
            user.id === userId 
              ? { ...user, subscriber_verified: !currentStatus, verified_at: !currentStatus ? new Date().toISOString() : null }
              : user
          ))
        }
        setMessage({ 
          type: 'success', 
          text: !currentStatus 
            ? '구독자로 설정되었습니다.' 
            : '구독자 인증이 해제되었습니다.' 
        })
        // 페이지 새로고침하여 모든 상태 동기화
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || '상태 변경에 실패했습니다.' })
      }
    } catch (error: any) {
      console.error('구독자 상태 변경 오류:', error)
      setMessage({ type: 'error', text: error?.message || '오류가 발생했습니다.' })
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 검색 바 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="이메일 또는 닉네임으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-nexo-navy hover:bg-nexo-cyan text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                검색
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 메시지 */}
      {message && (
        <div className={`p-4 mx-6 mt-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* 사용자 목록 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                닉네임
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                구독자 상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                시리얼 번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가입일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {search ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.nickname || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscriber_verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3" />
                        인증됨
                      </span>
                    ) : user.subscriber_verification_request ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        인증 요청
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3" />
                        미인증
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.purchase_serial_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      onClick={() => handleToggleSubscriber(user.id, user.subscriber_verified)}
                      disabled={updating === user.id}
                      size="sm"
                      className={
                        user.subscriber_verified
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : user.subscriber_verification_request
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    >
                      {updating === user.id ? (
                        <><Loader2 className="w-3 h-3 mr-1 animate-spin" />처리 중...</>
                      ) : user.subscriber_verified ? (
                        '인증 해제'
                      ) : user.subscriber_verification_request ? (
                        '승인하기'
                      ) : (
                        '구독자 설정'
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 통계 */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-6 text-sm flex-wrap">
          <div>
            <span className="text-gray-600">전체 사용자: </span>
            <span className="font-semibold text-gray-900">{users.length}명</span>
          </div>
          <div>
            <span className="text-gray-600">구독자 인증: </span>
            <span className="font-semibold text-green-600">
              {users.filter(u => u.subscriber_verified).length}명
            </span>
          </div>
          <div>
            <span className="text-gray-600">미인증: </span>
            <span className="font-semibold text-gray-600">
              {users.filter(u => !u.subscriber_verified).length}명
            </span>
          </div>
          <div>
            <span className="text-gray-600">승인 대기: </span>
            <span className="font-semibold text-amber-600">
              {users.filter(u => u.subscriber_verification_request).length}명
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

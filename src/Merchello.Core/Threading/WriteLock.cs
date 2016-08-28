﻿namespace Merchello.Core.Threading
{
    using System;
    using System.Threading;

    /// <summary>
    /// Provides a convenience methodology for implementing locked access to resources. 
    /// </summary>
    /// <remarks>
    /// Intended as an infrastructure class.
    /// </remarks>
    /// <seealso cref="https://github.com/umbraco/Umbraco-CMS/blob/dev-v7/src/Umbraco.Core/WriteLock.cs"/>
    public class WriteLock : IDisposable
    {
        /// <summary>
        /// The <see cref="ReaderWriterLock"/>.
        /// </summary>
        private readonly ReaderWriterLockSlim _rwLock;

        /// <summary>
        /// Initializes a new instance of the <see cref="WriteLock"/> class.
        /// </summary>
        /// <param name="rwLock">The <see cref="ReaderWriterLock"/>.</param>
        public WriteLock(ReaderWriterLockSlim rwLock)
        {
            _rwLock = rwLock;
            _rwLock.EnterWriteLock();
        }

        /// <summary>
        /// The dispose.
        /// </summary>
        void IDisposable.Dispose()
        {
            _rwLock.ExitWriteLock();
        }
    }
}